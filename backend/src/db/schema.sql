-- ENUM types
CREATE TYPE triage_status AS ENUM ('PENDING_AI', 'READY_FOR_REVIEW', 'COMPLETED');
CREATE TYPE urgency_tier AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'UNKNOWN');

-- Table: triage_jobs
CREATE TABLE triage_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT,
    status triage_status NOT NULL DEFAULT 'PENDING_AI',
    urgency_tier urgency_tier NOT NULL DEFAULT 'UNKNOWN',
    anatomical_location TEXT,
    findings TEXT[],
    draft_report_text TEXT,
    is_validated BOOLEAN DEFAULT false,
    flagged_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Extension: pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Table: medical_cases_index
CREATE TABLE medical_cases_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    triage_job_id UUID REFERENCES triage_jobs(id) ON DELETE CASCADE,
    report_embedding vector(768),
    clinical_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
