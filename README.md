# AI-Powered ITSM & Intelligent Helpdesk Automation Platform

An enterprise-grade ITSM support application inspired by Zoho Desk, designed to automate IT support workflows:

**Employee Request → AI Understanding → Knowledge Retrieval → Intelligent Decision → Automation → ServiceNow → Resolution**

---

## 1. Project Overview & Business Problem

IT Helpdesks are overwhelmed by repetitive support requests, domain password resets, software access requests, and routine troubleshooting inquiries. 

This platform acts as an intelligent enterprise self-service layer that:
- Classifies incoming employee requests automatically using AI.
- Uses Retrieval-Augmented Generation (RAG) with vector search across approved IT documents.
- Triggers automated self-healing workflows (e.g. Active Directory password resets, account unlocks, service restarts).
- Provisions developer software (Visual Studio Code, Git) automatically.
- Synchronizes incident numbers (`INC001001`) and service requests (`REQ001245`) with ServiceNow (Mock or Real REST API).
- Prevents AI hallucinations by withholding answers when RAG context confidence is insufficient and offering human escalation.

---

## 2. Technology Stack

- **Frontend**: React.js (Vite + TypeScript + Tailwind CSS), Lucide Icons. Designed with an enterprise SaaS layout inspired by Zoho Desk (dark slate sidebar, top header with mode badge, 3-column ticket views, compact data tables).
- **Backend**: Python FastAPI with Pydantic schemas.
- **Database**: MongoDB Atlas Cloud (`motor` async driver) with resilient fallback datastore.
- **Embeddings**: Open-source `sentence-transformers/all-MiniLM-L6-v2`.
- **Vector Database**: FAISS (Facebook AI Similarity Search).
- **LLM Pipeline**: Open-source Hugging Face model (`google/flan-t5-base`) with grounded prompt guardrails.
- **ITSM**: ServiceNow REST API abstraction layer supporting `MOCK` and `REAL` modes.
- **Containerization**: Docker & Docker Compose (`docker-compose.yml`).

---

## 3. High-Level Architecture

```
React Frontend (Port 3000)
       |
       v
FastAPI Backend (Port 8000)
       |
       +-----------------------+-----------------------+
       |                       |                       |
       v                       v                       v
FAISS RAG Vector Store    MongoDB Atlas Cloud    ServiceNow Adapter
 (sentence-transformers)  (tickets, audit, chat)  (Mock INC/REQ or Real REST)
       |
       v
Hugging Face LLM Pipeline
 (google/flan-t5-base)
```

---

## 4. Folder Structure

```
ai_itsm_helpdesk/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI entrypoint, CORS & startup lifespans
│   │   ├── config.py                  # Settings parser
│   │   ├── database/                  # MongoDB Atlas driver & index initializer
│   │   ├── api/                       # API Routers (chat, tickets, knowledge, automation, software, dashboard, servicenow)
│   │   ├── models/                    # Pydantic schemas
│   │   └── services/
│   │       ├── ai/                    # Hugging Face LLM & Classifier
│   │       ├── rag/                   # FAISS Vector store & Document loader
│   │       ├── servicenow/            # ServiceNow Client abstraction (Mock & Real)
│   │       ├── automation/            # Self-healing Password Reset & Account Unlock engines
│   │       └── provisioning/          # Software Catalogue & Provisioning service
│   ├── knowledge_base/                # 8 mandatory approved IT knowledge documents
│   ├── tests/                         # Pytest test suite for 5 demo scenarios
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/                # Sidebar, Header, StatusBadge, MetricCard, RAGSourceCard, AuditTimeline
│   │   ├── pages/                     # Dashboard, AIHelpdesk, Tickets, TicketDetail, AIAnalysis, KB, Automation, Software, Audit
│   │   ├── services/                  # Axios HTTP client
│   │   ├── types/                     # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 5. Five Mandatory Demonstration Scenarios

| Scenario | Natural Language Input | Workflow & Action | Expected Result |
| :--- | :--- | :--- | :--- |
| **Scenario 1** | *"My VPN is not connecting."* | Incident Intake Pipeline | Intent: Incident \| Category: Network \| Priority: P2 \| Assignment: Network Support. RAG lookup → ServiceNow Incident created (`INC001001`). |
| **Scenario 2** | *"My password has expired."* | Automatable Issue Engine | Intent: Automatable Issue \| Approved KB match → Executes Mock Password Reset API → Validation: Success → ServiceNow Update → Audit Log generated. |
| **Scenario 3** | *"How do I troubleshoot Outlook synchronization?"* | Knowledge Q&A | Intent: Knowledge Question → FAISS Vector Search → Outlook KB chunk retrieved → Grounded response + displayed RAG sources & score. |
| **Scenario 4** | *"I need Visual Studio Code."* | Software Provisioning | Intent: Service Request → Software Catalog match → ServiceNow Request (`REQ001245`) → Mock Provisioning API → Status: Provisioned (MOCK). |
| **Scenario 5** | *"What is the policy for reimbursing luxury dinner expenses?"* | Unsupported / Low Confidence | Similarity score < Threshold → Answer: *"Information unavailable in the approved knowledge base."* → Low Confidence warning → Human Escalation option. |

---

## 6. Docker Startup Instructions

### Prerequisites
- Docker & Docker Compose installed.

### Quick Run via Docker Compose
1. Clone repository and navigate to root directory:
   ```bash
   cd ai_itsm_helpdesk
   ```
2. Copy environment template:
   ```bash
   cp .env.example .env
   ```
3. Build and start containers:
   ```bash
   docker compose up --build
   ```
4. Access Application URLs:
   - **React Frontend**: `http://localhost:3000`
   - **FastAPI Backend**: `http://localhost:8000`
   - **Swagger API Docs**: `http://localhost:8000/docs`

---

## 7. MongoDB Atlas Configuration

1. Set `MONGODB_URI` in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DATABASE=itsm_helpdesk
   ```
2. On startup, the backend automatically connects to Atlas Cloud and creates collection indexes for `tickets`, `audit_logs`, and `knowledge`.
3. If `MONGODB_URI` is left blank, the system automatically uses a thread-safe in-memory fallback datastore so the application can run offline immediately.

---

## 8. ServiceNow Configuration (Mock vs Real)

- **Mock Mode (Default)**: Set `SERVICENOW_MODE=mock`. The system uses stateful `MockServiceNowClient` generating realistic `INCxxxxxx` and `REQxxxxxx` numbers and maintaining full state CRUD operations. The UI displays `ServiceNow Mode: MOCK`.
- **Real ServiceNow Mode**: Set `SERVICENOW_MODE=real` and configure:
  ```env
  SERVICENOW_URL=https://dev00000.service-now.com
  SERVICENOW_USERNAME=admin
  SERVICENOW_PASSWORD=your_password
  ```
  The adapter connects via standard REST APIs (`/api/now/table/incident` and `/api/now/table/sc_request`).

---

## 9. RAG Architecture & No-Hallucination Guardrails

1. **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2` encodes 8 markdown knowledge base documents in `backend/knowledge_base/`.
2. **FAISS Vector Store**: Uses Inner Product Cosine Index (`faiss.IndexFlatIP`) for rapid similarity search.
3. **No-Hallucination Guardrail**:
   - If `max_similarity_score` < `RAG_SIMILARITY_THRESHOLD` (0.35):
     - The AI does NOT fabricate an answer from internal weights.
     - Returns `"Information unavailable in the approved knowledge base."`
     - Flags `human_escalation_required=True` and renders the **"Create Helpdesk Ticket"** escalation button.

---

## 10. Automated Testing

Run the pytest test suite covering all endpoints and 5 mandatory scenarios:

```bash
cd backend
python -m pytest tests/ -v
```

---

## 11. Known Limitations & Production Readiness

- **Model Execution**: Runs Hugging Face CPU inference locally in Docker. For production, connect to Hugging Face Inference Endpoints or vLLM server.
- **Mock Automation**: Safe mock APIs execute password resets and software deployments. In production, connect Active Directory via LDAP/Graph API and Ansible/SCCM for software deployment.
