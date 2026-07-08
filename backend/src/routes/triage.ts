import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { evaluateClinicalDraft } from '../services/evaluator';
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

async function runAsyncAnalysis(imageUrl: string, jobId: string, imageBase64: string, mimeType: string) {
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    let resultJson;
    try {
        const ai = new GoogleGenAI({ vertexai: true, project: projectId!, location: location });
        
        const prompt = `System: You are an expert medical AI. Analyze the image and return a JSON object with this exact schema:
{
  "anatomicalLocation": "string (e.g. Chest, Knee)",
  "findings": ["string"],
  "urgencyTier": "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN",
  "draftReportText": "Detailed diagnostic report"
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: mimeType, data: imageBase64 } }
                    ]
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
             draftReportText: "Error connecting to Vertex AI Gemini 3.5 Pro."
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
        const { imageUrl, jobId, imageBase64, mimeType } = req.body;

        if (!imageUrl || !jobId) {
            res.status(400).json({ error: 'Payload must contain imageUrl and jobId.' });
            return;
        }

        const evaluatedResult = await runAsyncAnalysis(imageUrl, jobId, imageBase64 || "", mimeType || "image/png");
        res.status(200).json(evaluatedResult);

    } catch (error) {
        console.error('Error in /api/triage/analyze:', error);
        res.status(500).json({ error: 'Internal server error processing triage image' });
    }
});

router.post('/upload', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No image file provided.' });
            return;
        }

        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
        
        const { data, error: uploadError } = await supabase
            .storage
            .from('diagnostic_images')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            res.status(500).json({ error: 'Failed to upload image.' });
            return;
        }

        const { data: publicUrlData } = supabase
            .storage
            .from('diagnostic_images')
            .getPublicUrl(fileName);
            
        const imageUrl = publicUrlData.publicUrl;

        const { data: dbData, error: dbError } = await supabase
            .from('triage_jobs')
            .insert([{ image_url: imageUrl, status: 'PENDING_AI' }])
            .select('id')
            .single();

        if (dbError || !dbData) {
            console.error('Database insert error:', dbError);
            res.status(500).json({ error: 'Failed to create triage job.' });
            return;
        }

        const jobId = dbData.id;
        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        runAsyncAnalysis(imageUrl, jobId, imageBase64, mimeType).catch(console.error);

        res.status(202).json({ jobId, imageUrl, message: 'Upload successful, AI processing started.' });
    } catch (error) {
        console.error('Error in /upload:', error);
        res.status(500).json({ error: 'Internal server error during upload.' });
    }
});

export default router;
