
-- Authentication & User Core
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255),
    google_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    auth_provider VARCHAR(32) DEFAULT 'local', -- 'local', 'google'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles (Demographics & UPSC metadata)
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(128),
    middle_name VARCHAR(128),
    last_name VARCHAR(128),
    gender VARCHAR(16),
    dob DATE,
    education VARCHAR(255),
    target_year INT,
    optional_subject VARCHAR(128),
    medium VARCHAR(32) DEFAULT 'English',
    attempt_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Conversation Logs (Tracks full interaction metrics)
CREATE TABLE IF NOT EXISTS conversation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(16) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    latency_ms INT DEFAULT 0,
    model_name VARCHAR(64),
    rag_sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enterprise Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,      -- e.g., 'AUTH_LOGIN', 'PROFILE_UPDATE', 'SESSION_DELETE'
    resource VARCHAR(64) NOT NULL,    -- target table/entity
    resource_id VARCHAR(64),
    payload JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- AI Ingestion & RAG Knowledge Store
CREATE TABLE IF NOT EXISTS upsc_knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_title VARCHAR(255) NOT NULL,
    source_type VARCHAR(64) NOT NULL, -- 'NCERT', 'StandardBook', 'CurrentAffairs', 'Syllabus'
    subject VARCHAR(64),              -- 'Polity', 'History', 'Economy', etc.
    paper VARCHAR(16),                -- 'GS1', 'GS2', 'GS3', 'GS4', 'Prelims'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536),           -- Standard dimension for OpenAI (or 768/1024 for open models)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);