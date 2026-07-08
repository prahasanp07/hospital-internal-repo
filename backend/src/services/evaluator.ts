import { GoogleGenAI } from '@google/genai';
import { supabase } from '../db/client';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.GOOGLE_PROJECT_ID;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

const HIGH_RISK_TERMS = ['fracture', 'mass', 'acute', 'hemorrhage', 'occlusion'];

export async function evaluateClinicalDraft(medgemmaOutput: any, jobId: string): Promise<any> {
    let isValidated = true;
    let urgencyTier = medgemmaOutput.urgencyTier;
    let draftReportText = medgemmaOutput.draftReportText;
    const findings: string[] = medgemmaOutput.findings || [];
    const anatomicalLocation = medgemmaOutput.anatomicalLocation;

    // 1. Rule-based gatekeeper
    if (urgencyTier === 'LOW') {
        const findingsText = findings.join(' ').toLowerCase();
        const hasHighRiskTerm = HIGH_RISK_TERMS.some(term => findingsText.includes(term));
        
        if (hasHighRiskTerm) {
            isValidated = false;
            urgencyTier = 'HIGH'; // correctedUrgencyTier
        }
    }

    // 2. Vertex AI Verification Pass
    // We send a verification prompt to the model to ensure draftReportText comprehensively reflects findings
    const verificationPrompt = `
System Rules: You are a medical quality assurance gatekeeper.
Verify that the following draft report comprehensively reflects ALL the findings listed.
Findings: ${JSON.stringify(findings)}
Draft Report: ${draftReportText}
Return ONLY a valid JSON object: { "isValidated": boolean, "reason": "string (empty if valid)" }
`;

    let aiValidated = true;
    let flaggedReason = null;

    try {
        const ai = new GoogleGenAI({ vertexai: true, project: projectId!, location: location });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: verificationPrompt,
            config: {
                temperature: 0.0,
                responseMimeType: "application/json"
            }
        });

        const responseText = response.text || "{}";
        const parsed = JSON.parse(responseText);
        
        if (parsed.isValidated === false) {
            aiValidated = false;
            flaggedReason = parsed.reason;
        }
    } catch (apiError) {
        console.warn("AI verification pass failed, falling back to rule-based validation state.", apiError);
    }

    if (!aiValidated) {
        isValidated = false;
    }

    // 3. Modifying Output
    if (!isValidated) {
        draftReportText = `[CRITICAL REVIEW REQUIRED] ${draftReportText}`;
    }

    // 4. Update Supabase Database
    const { error } = await supabase
        .from('triage_jobs')
        .update({
            anatomical_location: anatomicalLocation,
            findings: findings,
            urgency_tier: urgencyTier,
            draft_report_text: draftReportText,
            is_validated: isValidated,
            flagged_reason: flaggedReason || (isValidated ? null : 'Rule-based check failed: High risk terms found in LOW urgency tier.'),
            status: 'READY_FOR_REVIEW',
            updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

    if (error) {
        console.error(`Failed to update job ${jobId} in Supabase:`, error);
    }

    return {
        jobId,
        anatomicalLocation,
        findings,
        urgencyTier,
        draftReportText,
        isValidated,
        flaggedReason,
        status: 'READY_FOR_REVIEW'
    };
}
