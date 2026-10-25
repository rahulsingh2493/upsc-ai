
-- Vector indexing: HNSW for fast nearest-neighbor lookups
CREATE INDEX IF NOT EXISTS idx_upsc_chunks_embedding_hnsw 
ON upsc_knowledge_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Text search indexing for hybrid retrieval
CREATE INDEX IF NOT EXISTS idx_upsc_chunks_content_trgm 
ON upsc_knowledge_chunks 
USING gin (content gin_trgm_ops);

-- Audit & Query performance indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_session ON conversation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_user ON conversation_logs(user_id);