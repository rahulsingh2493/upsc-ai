
upsc-ai-tutor/
├── Makefile                                    # Single entry point: `make dev`, `make test`, `make down`
├── docker-compose.yml                          # Full-stack orchestrator: frontend, backend, ai, db, redis
├── docker-compose.override.yml.example         # Local dev hot-reloads & port overrides
├── .env.example                                # Master environment variable template
├── .gitignore
├── README.md
│
├── deploy/                                     # Shared local & cloud infra assets
│   ├── docker/
│   │   ├── postgres/
│   │   │   ├── Dockerfile                      # PostgreSQL with pgvector extension pre-installed
│   │   │   └── init-extensions.sql             # CREATE EXTENSION IF NOT EXISTS vector; uuid-ossp;
│   │   └── redis/
│   │       └── redis.conf                      # Optimized for pub/sub & rate-limit TTLs
│   └── scripts/
│       ├── wait-for-it.sh                      # Port readiness coordination script
│       └── local_bootstrap.py                  # Auto-runs DB migrations and seeds syllabus taxonomy

├── backend/                                    # Module 2: Core Platform API (FastAPI)
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/
│   └── app/
│       ├── main.py                             # FastAPI bootstrap & Lifespan handler
│       ├── core/
│       │   ├── config.py                       # Pydantic BaseSettings
│       │   ├── database.py                     # Async SQLAlchemy session factory
│       │   ├── security.py                     # Argon2 password hashing & JWT engine
│       │   ├── logging.py                      # JSON structured logging formatter
│       │   └── rate_limiter.py                 # Redis sliding-window token bucket algorithm
│       ├── middlewares/
│       │   ├── correlation_id.py               # Assigns X-Request-ID across microservices
│       │   ├── rate_limit_middleware.py        # Enforces rate limits per IP / User Tier
│       │   ├── audit_middleware.py             # Intercepts state changes & streams to audit sink
│       │   └── error_handler.py                # RFC-7807 compliant error responses
│       ├── models/
│       │   ├── base.py
│       │   ├── user.py                         # User identity & credentials
│       │   ├── profile.py                      # Demographics & UPSC preferences
│       │   ├── audit_log.py                    # Structured audit records (actor, target, payload)
│       │   ├── conversation_log.py             # User queries, AI responses, latency, tokens used
│       │   └── session.py                      # Active sessions & device tracking
│       ├── schemas/
│       │   ├── auth.py
│       │   ├── user.py
│       │   ├── profile.py
│       │   ├── audit.py                        # Audit query schemas
│       │   └── conversation.py                 # Chat payloads & conversation log models
│       ├── api/
│       │   └── v1/
│       │       ├── router.py
│       │       └── endpoints/
│       │           ├── auth.py
│       │           ├── users.py
│       │           ├── conversations.py
│       │           └── ai_proxy.py             # Proxies user prompts to Module 3 (SSE/gRPC)
│       ├── services/
│       │   ├── auth_service.py
│       │   ├── user_service.py
│       │   ├── audit_service.py                # Writes audit trails asynchronously
│       │   ├── conversation_logger_service.py  # Asynchronously saves prompt/response metrics
│       │   └── ai_gateway_service.py           # Internal communication with AI Engine
│       └── repositories/
│           ├── audit_repository.py
│           ├── conversation_log_repository.py
│           ├── user_repository.py
│           └── profile_repository.py
│
└── ai_engine/                                  # Module 3: Autonomous AI & ML System
    ├── Dockerfile
    ├── pyproject.toml
    ├── config/
    │   ├── engine_settings.py
    │   └── agent_manifests.yaml
    ├── server/
    │   ├── app.py                              # FastAPI/gRPC endpoint for inference
    │   └── routers/
    │       ├── inference.py                    # Direct completions
    │       └── streaming.py                    # Server-Sent Events (SSE) stream to backend
    ├── ingestion/                              # Document processing pipelines
    │   ├── parsers/                            # NCERT, standard books, syllabus trees
    │   ├── chunkers/                           # Semantic & hierarchical chunking
    │   └── embedders/                          # Text embeddings wrapper
    ├── retrieval/                              # Search subsystems
    │   ├── vector_store/
    │   │   └── pgvector_store.py               # Connects to shared PostgreSQL instance
    │   ├── search/
    │   │   └── hybrid_retriever.py             # Dense (pgvector) + Sparse (BM25) with RRF
    │   └── rerankers/
    │       └── cross_encoder_reranker.py
    ├── generation/                             # LLM orchestration
    │   ├── providers/                          # Open-source vLLM / OpenAI / Anthropic interfaces
    │   └── prompts/                            # Jinja2 evaluation templates & prompt builders
    └── workflows/                              # Multi-Agent DAGs & state transitions
        ├── state.py
        ├── graph_engine.py
        └── agents/
            ├── mains_evaluator_agent.py
            ├── prelims_quizzer_agent.py
            └── general_tutor_agent.py