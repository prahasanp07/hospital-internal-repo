import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { evaluateClinicalDraft } from '../services/evaluator';
import { convertDatToVisualPlot } from '../services/waveformConverter';
import multer from 'multer';
import { supabase } from '../db/client';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Active SSE clients for doctor dashboard
let sseClients: Response[] = [];

router.get('/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive'); // Standard SSE header (fulfills keep-open request)
    res.flushHeaders();

    sseClients.push(res);

    req.on('close', () => {
        sseClients = sseClients.filter(client => client !== res);
        res.end();
    });
});

async function runAsyncAnalysis(filePayloads: any[], jobId: string) {
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    let resultJson;
    try {
        const ai = new GoogleGenAI({ vertexai: true, project: projectId!, location: location });
        
        const prompt = `System: You are an elite, board-certified clinical diagnostics and document understanding engine.
Context: You are presented with a collection of de-identified files associated with a single clinical encounter. These may include a combination of 2D/3D radiology scans, multi-page laboratory report PDFs, or diagnostic photographs.
Task:
1. Consolidate and cross-examine ALL provided inputs collectively.
2. Identify and explicitly list the anatomical locations or document titles detected across all files.
3. Identify primary structural abnormalities, critical laboratory value flags, or diagnostic anomalies across the items.
4. Set 'urgencyTier' to 'HIGH' if you detect critical signs (e.g., severe lab drops, tissue necrosis, hardware failures, or acute internal trauma). Otherwise, determine an accurate triage tier.
5. Synthesize a unified, comprehensive preliminary report draft.
Constraints:
- Return your final analysis strictly as a raw, single, unquoted minified JSON object matching this schema exactly:
{
  "anatomicalLocation": "string list or document titles summary",
  "findings": ["string"],
  "urgencyTier": "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN",
  "draftReportText": "string"
}`;

        // Intercept and preprocess any .dat waveform files
        for (const f of filePayloads) {
            if (f.fileType === 'VOLUME_SLICE' && (f.fileUrl.endsWith('.dat') || f.mimeType === 'application/octet-stream')) {
                try {
                    const rawBuffer = Buffer.from(f.base64, 'base64');
                    const plotBase64 = await convertDatToVisualPlot(rawBuffer);
                    f.mimeType = 'image/png';
                    f.base64 = plotBase64;
                } catch (e) {
                    console.error("Failed to convert .dat waveform:", e);
                }
            }
        }

        const parts = [
            { text: prompt },
            ...filePayloads.map(f => ({ inlineData: { mimeType: f.mimeType, data: f.base64 } }))
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                {
                    role: 'user',
                    parts: parts
                }
            ],
            config: {
                temperature: 0.0,
                responseMimeType: "application/json"
            }
        });

        const responseText = response.text || "{}";
        resultJson = JSON.parse(responseText);

    } catch (apiError) {
         console.error("Vertex AI call failed. Using fallback format:", apiError);
         resultJson = {
             anatomicalLocation: "Unknown",
             findings: ["Could not process via AI.", String(apiError)],
             urgencyTier: "UNKNOWN",
             draftReportText: "Error connecting to Vertex AI Gemini Pro."
         };
    }

    const evaluatedResult = await evaluateClinicalDraft(resultJson, jobId);

    if (evaluatedResult.status === 'READY_FOR_REVIEW') {
        const eventPayload = `data: ${JSON.stringify(evaluatedResult)}\n\n`;
        sseClients.forEach(client => client.write(eventPayload));
    }
    
    return evaluatedResult;
}

router.post('/analyze', async (req: Request, res: Response): Promise<void> => {
    try {
        const { filePayloads, jobId } = req.body;

        if (!filePayloads || !jobId) {
            res.status(400).json({ error: 'Payload must contain filePayloads and jobId.' });
            return;
        }

        const evaluatedResult = await runAsyncAnalysis(filePayloads, jobId);
        res.status(200).json(evaluatedResult);

    } catch (error) {
        console.error('Error in /api/triage/analyze:', error);
        res.status(500).json({ error: 'Internal server error processing triage files' });
    }
});

router.post('/upload', upload.array('files'), async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            res.status(400).json({ error: 'No files provided.' });
            return;
        }

        const filePayloads = [];
        
        for (const file of files) {
            const fileExt = file.originalname.split('.').pop()?.toLowerCase() || 'bin';
            const isDat = fileExt === 'dat';
            
            const allowedMimeTypes = /^(image\/(jpeg|png|webp))|(application\/pdf)|(application\/dicom)$/;
            if (!allowedMimeTypes.test(file.mimetype) && !isDat) {
                console.error('Unsupported file type:', file.mimetype, 'ext:', fileExt);
                continue;
            }

            const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
            
            const { error: uploadError } = await supabase
                .storage
                .from('diagnostic_images')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype
                });

            if (uploadError) {
                console.error('Supabase upload error:', uploadError);
                continue;
            }

            const { data: publicUrlData } = supabase
                .storage
                .from('diagnostic_images')
                .getPublicUrl(fileName);
                
            let fileType = 'UNKNOWN';
            if (file.mimetype === 'application/pdf') {
                fileType = 'PDF_DOC';
            } else if (file.mimetype.includes('dicom') || isDat) {
                fileType = 'VOLUME_SLICE';
            } else if (file.mimetype.startsWith('image/')) {
                fileType = 'IMAGE';
            }

            filePayloads.push({
                fileUrl: publicUrlData.publicUrl,
                fileType: fileType,
                mimeType: file.mimetype,
                base64: file.buffer.toString('base64')
            });
        }

        if (filePayloads.length === 0) {
            res.status(500).json({ error: 'Failed to upload files to storage.' });
            return;
        }

        const dbPayload = filePayloads.map(f => ({ fileUrl: f.fileUrl, fileType: f.fileType }));

        const { data: dbData, error: dbError } = await supabase
            .from('triage_jobs')
            .insert([{ file_payloads: dbPayload, status: 'PENDING_AI' }])
            .select('id')
            .single();

        if (dbError || !dbData) {
            console.error('Database insert error:', dbError);
            res.status(500).json({ error: 'Failed to create triage job.' });
            return;
        }

        const jobId = dbData.id;

        runAsyncAnalysis(filePayloads, jobId).catch(console.error);

        res.status(202).json({ jobId, message: 'Upload successful, AI processing started.' });
    } catch (error) {
        console.error('Error in /upload:', error);
        res.status(500).json({ error: 'Internal server error during upload.' });
    }
});

export default router;
