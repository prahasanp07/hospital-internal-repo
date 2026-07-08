import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const projectId = process.env.GOOGLE_PROJECT_ID;
const location = 'us-central1';

router.post('/process', async (req, res) => {
    try {
        const { transcript } = req.body;
        
        if (!transcript) {
            return res.status(400).json({ error: 'No transcript provided.' });
        }

        const ai = new GoogleGenAI({ vertexai: true, project: projectId!, location: location });

        const prompt = `System: You are an expert clinical documentation AI. Your task is to process the following ambient consultation transcript and extract clinical entities into a strictly formatted FHIR R4 JSON Bundle. 
        
Extract:
1. Patient demographics (Patient resource)
2. Diagnoses or Symptoms (Condition resources)
3. Medications (See selection criteria below)

RESOURCE SELECTION CRITERIA:
- When parsing the transcript, if a medication was explicitly given, executed, or swallowed in-clinic/at the facility (e.g., phrases like 'administered', 'gave', 'nebulized stat'), you MUST generate a FHIR R4 'MedicationAdministration' resource with \`status: 'completed'\`. Reserve 'MedicationStatement' or 'MedicationRequest' solely for outpatient prescriptions or patient-reported home usage.
- Generate a FHIR R4 'MedicationRequest' resource when a clinician orders a new prescription for the patient to fill and take externally/at home (e.g., 'prescribed', 'discharged with').
- Generate a FHIR R4 'MedicationStatement' resource when a patient reports taking a background medication historically at home (e.g., 'takes daily at home', 'current home regimen').

Ensure all output is wrapped in a standard FHIR Bundle resource.
For MedicationAdministration, ensure the JSON structure includes 'effectiveDateTime' and 'dosage.dose' (e.g., "dosage": { "dose": { "value": X, "unit": "Y" } }).
ONLY output valid JSON. Do not output markdown backticks. Do not include introductory text.

Transcript:
"${transcript}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.0,
                responseMimeType: 'application/json'
            }
        });

        const responseText = response.text || "{}";
        const fhirJson = JSON.parse(responseText);

        res.json(fhirJson);

    } catch (error: any) {
        console.error("Error processing scribe transcript:", error);
        res.status(500).json({ error: 'Failed to process transcript.', details: error.message });
    }
});

export default router;
