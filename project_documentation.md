# MedGemma: Clinical Automation Suite

MedGemma is a full-stack clinical automation application powered by Google Vertex AI (Gemini). It features a modern, glassmorphic UI built with Angular 18 and a robust Node.js/Express backend. 

The application is split into two core modules:
1. **App 4: Multimodal Triaging** (Image diagnostics)
2. **App 3: EHR & Scribe** (Transcript parsing & FHIR extraction)

---

## 🏗️ Architecture Overview

### Frontend (Angular 18)
The frontend uses a modern standalone-component architecture, heavily relying on **GSAP** for fluid, high-end micro-animations and layout transitions. State is managed via **NgRx**, and the design language utilizes **Angular Material** combined with custom glassmorphic CSS overlays.

- **Routing (`app.routes.ts`)**: Handles seamless transitions between `/triage` and `/scribe`.
- **Root Layout (`app.component.ts`)**: A dynamic, collapsible sidebar layout with smooth GSAP transition animations.
- **Triage Dashboard (`triage-dashboard.component.ts`)**: 
  - **Image Viewer**: Allows users to upload medical images (DICOM/PNG mockups).
  - **Triage Form**: Subscribes to NgRx state. It auto-fills clinical assessment fields (Anatomical Location, Urgency Tier, Findings, Draft Report) dynamically as the backend processes the image via **Server-Sent Events (SSE)**.
- **Scribe Dashboard (`scribe-dashboard.component.ts`)**: Ingests ambient clinical transcripts (text) and renders formatted **FHIR R4 JSON** bundles returned from the AI.

### Backend (Node.js & Express)
The backend acts as an orchestration layer connecting the frontend to Google Cloud's Vertex AI ecosystem.

- **`index.ts`**: The main Express server entry point.
- **`routes/triage.ts`**: Handles image uploads via `multer`, invokes the Vertex AI evaluator, and streams the structured diagnostic JSON back to the client via **SSE (Server-Sent Events)**.
- **`routes/scribe.ts`**: Handles raw text transcripts and prompts `gemini-2.5-pro` with strict `temperature: 0.0` settings to parse and generate deterministic **FHIR R4 JSON**.
- **`services/evaluator.ts`**: The core AI integration service utilizing the official `@google/genai` SDK to interface with Vertex AI models.

### Database (PostgreSQL / Supabase)
- **`schema.sql`**: Defines the foundational table structures for persistent storage. Features `pgvector` native tables designed for future medical index semantic searching.

---

## 🚀 Key Features

### 1. AI-Powered Image Triage
Clinicians can upload medical images (like X-Rays or Fetal Echocardiograms). The backend uses Gemini Pro Multimodal capabilities to assess the image and generate a structured JSON containing:
- `anatomicalLocation`
- `findings` (array of observations)
- `urgencyTier` (LOW, MEDIUM, HIGH)
- `draftReportText`

### 2. Clinical Scribe & FHIR Extraction
Clinicians can paste ambient consultation transcripts (e.g., "Patient John Doe presents with hypertension..."). The AI acts as a medical scribe, extracting linguistic reasoning and mapping it exactly to standard **FHIR R4 JSON Blocks** (e.g., `Patient`, `Condition`, `MedicationStatement`).

### 3. Asynchronous Streaming (SSE)
The application utilizes Server-Sent Events to push updates to the Angular frontend in real-time, preventing browser timeouts on long-running AI inferences and providing a highly responsive UX.

---

## 🛠️ Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | Angular (v18+), TypeScript |
| **Frontend Styling/UI** | Vanilla CSS, GSAP (Animations), Angular Material |
| **State Management** | NgRx |
| **Backend Framework** | Node.js, Express, TypeScript |
| **AI Integration** | Vertex AI (`@google/genai`), Gemini 2.5 Pro |
| **Database** | PostgreSQL (Supabase schema) |

---

## ⚙️ Configuration & Setup

### Prerequisites
- Node.js (v18+)
- Angular CLI (`npm install -g @angular/cli`)
- Google Cloud Project with Vertex AI API enabled.
- Google Cloud Service Account JSON Key.

### Backend Setup
1. Navigate to the `/backend` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file containing your Google Cloud project details:
   ```env
   GOOGLE_PROJECT_ID=medgemma-ai-500912
   ```
4. Place your Google Cloud Service Account Key JSON in the backend folder (e.g., `medgemma-ai-500912-fe89c0fe5481.json`). The `@google/genai` library automatically authenticates if your environment is correctly configured.
5. Start the development server:
   ```bash
   npm run dev
   ```
   *(Runs on `http://localhost:3000`)*

### Frontend Setup
1. Navigate to the `/frontend` directory.
2. Install dependencies: `npm install`
3. Start the Angular development server:
   ```bash
   npm start
   ```
   *(Runs on `http://localhost:4200`)*

---

## 🛡️ Security & Guardrails
- **No Hardcoded Secrets**: All API keys and project configurations are dynamically loaded from `.env`.
- **Deterministic AI Generation**: Prompts utilizing clinical data enforce `temperature: 0.0` to ensure strict, reproducible, and standardized JSON outputs.
- **Strict Typing**: The backend enforces structural API contracts using TypeScript interfaces to prevent runtime crashes during AI payload parsing.
