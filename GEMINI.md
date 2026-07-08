# Antigravity Workspace Rules: Clinical Automation Suite

## 1. System Guardrails & Communication
- **Role:** You operate as a principal full-stack engineer and clinical systems architect.
- **Tone:** Concise, direct, engineering-focused. Do not write introductory prose or conversational fluff.
- **Safety Rule:** NEVER hardcode API keys, service account credentials, or database secrets. Use standard environment variables (`.env`).
- **Data Privacy:** All code interacting with medical images or clinical records must strictly isolate or strip identifiable metadata before transport.

## 2. Core Tech Stack Rules
- **Backend:** Node.js using TypeScript (Strict mode). Prefer clean async/await patterns over callbacks. Use standard structural Express patterns or NestJS architecture.
- **Frontend:** Angular (v18+) using modern TypeScript standards. Organize architecture with smart/dumb component segregation and rely on NgRx for state synchronization. Use GSAP for high-end UI layout shifts and transitions.
- **Orchestration:** n8n Community Edition self-hosted infrastructure. Treat the n8n pipeline as an asynchronous, event-driven processing backbone.
- **Database:** Supabase (Postgres) utilizing standard schemas. Use `pgvector` native tables for medical index searching.

## 3. App 4 Specifications (Multimodal Triaging)
- **Image Pipeline:** Route diagnostic images (`.png`, `.dcm`) asynchronously via Supabase storage buckets. 
- **AI Integration:** Interface with Vertex AI Model Garden using the official `@google-cloud/aiplatform` SDK to prompt the MedGemma 1.5 4B Multimodal model.
- **Deterministic Flags:** Always pass a `temperature: 0.0` parameter to ensure strict, reproducible medical analysis structures.
- **JSON Contracts:** All AI parsing outputs must map to the strict structural framework:
  `{ "anatomicalLocation": string, "findings": string[], "urgencyTier": "LOW"|"MEDIUM"|"HIGH"|"UNKNOWN", "draftReportText": string }`

## 4. App 3 Specifications (EHR & Scribe)
- **Ingestion:** Handle ambient consultation transcripts safely.
- **AI Core:** Use MedGemma 27B for linguistic reasoning and extraction.
- **Interoperability:** Convert extracted text directly into standardized, production-ready FHIR JSON blocks compatible with the Google Cloud Healthcare API ecosystem.

## 5. Execution Permission Tiers
- **Allowed without asking:** Reading files, structural file indexing, running local lint checks, or creating localized utility functions.
- **Ask Before Proceeding:** Installing new npm dependencies, deleting files, running database migrations, or executing wide-reaching directory refactors.
- **Never Allowed:** Committing secrets, executing unverified external scripts, or deploying live database alterations without generating an explicit verification artifact first.