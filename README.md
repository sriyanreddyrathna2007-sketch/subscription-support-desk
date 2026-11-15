# SupportDesk AI - AI-Powered Subscription Product Support Desk

SupportDesk AI is a modern, responsive, full-stack customer support and subscription management platform built with **React**, **Tailwind CSS**, **FastAPI**, **SQLAlchemy**, and an **AI Support Copilot**.

The platform provides end-to-end self-service for SaaS customers to manage their subscriptions, resolve failed payments, inspect billing receipts, and interact with a policy-grounded AI assistant. When human intervention is required, support agents and administrators manage the resolution lifecycle via specialized role-based workspaces.

---

## 🌟 Key Highlights & Features

### 1. Customer Self-Service Portal
* **Dashboard Overview**: Instant summary cards displaying active plan, billing status, open tickets, and next renewal date.
* **Subscription Management**: Seamlessly upgrade or downgrade between **Basic** ($19/mo), **Pro** ($49/mo), and **Enterprise** ($199/mo) tiers with prorated simulated billing.
* **Subscription Cancellation**: Multi-reason cancellation flow retaining access through the active period end.
* **Itemized Billing History**: Filterable invoice table with simulated payment methods and one-click receipt downloads.
* **Interactive AI Assistant**: Real-time chatbot grounded in verified knowledge-base articles with automated ticket pre-filling for unresolved inquiries.
* **Support Ticket Lifecycle**: Create, track, and correspond with support agents through real-time threaded replies.

### 2. Support Agent Workspace
* **Triage Metrics**: Real-time counter for assigned tickets, active queue, urgent SLA breaches, resolved tickets, and average resolution times.
* **Live Ticket Queue**: Filter by category, priority, and status with immediate claim-to-self assignment.
* **AI Agent Copilot**:
  * **1-Click Ticket Summarization**: Extracts key customer problem points and sentiment.
  * **AI Response Suggestions**: Auto-drafts professional replies grounded in company policy.
  * **Editable Draft Composer**: Agents can review, customize, or add internal staff notes before sending.

### 3. Administrator Console
* **Tenant & Role Management**: Search all registered users and promote/demote roles between `Customer`, `Support Agent`, and `Administrator`.
* **Subscription Plan Control**: Configure pricing, descriptions, and feature lists.
* **Knowledge Base CMS**: Add, edit, publish, and archive official support documentation used by the AI model.
* **Audit Trail**: Immutable security log tracking all logins, upgrades, cancellations, role changes, and ticket updates.

### 4. AI Engine & Policy Retrieval
* **Grounding & Safety**: Restricts responses to approved documentation to prevent policy hallucination.
* **Clear Demo Mode**: Displays explicit demo badges and indicators when external AI credentials are not provided.
* **Configurable Provider**: Plug and play OpenAI (`gpt-4o-mini`), Gemini, or custom models via standard environment variables.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Lucide React, React Router 6 |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, Python-Jose (JWT), Bcrypt |
| **Database** | PostgreSQL & SQLite supported via SQLAlchemy 2.0 & Alembic |
| **AI Integration** | Configurable AI Provider Engine (OpenAI / Gemini / Grounded Demo Mode) |
| **Containerization** | Docker & Docker Compose |

---

## 👥 Pre-Seeded Demo Accounts

The application automatically seeds initial accounts, tiers, knowledge-base articles, and realistic ticket history upon initial startup.

| Role | Email | Password | Intended Workflow |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@demo.com` | `Password123!` | Customer self-service, plan upgrades, AI chat, ticket replies |
| **Support Agent** | `agent@demo.com` | `Password123!` | Ticket queue triaging, AI response drafting, status updates |
| **Administrator** | `admin@demo.com` | `Password123!` | User role assignment, plan editing, KB authoring, audit logs |

> 💡 **Tip:** You can also use the **"One-Click Demo"** switcher located on the top navigation bar and sidebar to jump between roles instantly without typing credentials!

---

## 🚀 Getting Started Locally

### Prerequisites
* **Python** 3.10+ (Python 3.12 recommended)
* **Node.js** 18+ (Node 20+ recommended)
* **npm** or **pnpm**

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Run database migrations and start the backend:
   ```bash
   alembic upgrade head
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *The backend starts at `http://127.0.0.1:8000`. Interactive OpenAPI documentation is accessible at `http://127.0.0.1:8000/docs`.*

---

### Step 2: Frontend Setup

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend starts at `http://localhost:5173`.*

---

## 🐳 Running with Docker Compose (PostgreSQL)

To run the complete application with PostgreSQL:

```bash
docker-compose up --build
```

* **Frontend**: `http://localhost:5173`
* **FastAPI Backend**: `http://localhost:8000`
* **PostgreSQL Database**: `localhost:5432`

---

## 🧪 Running the Test Suite

Run the full integration test suite covering authentication, RBAC, ticket creation, customer ownership restrictions, subscription changes, and AI fallback behavior:

```bash
cd backend
python tests/test_endpoints.py
```

Expected output:
```text
[PASS] Health check passed
[PASS] Customer login passed
[PASS] Agent login passed
[PASS] Admin login passed
[PASS] Role RBAC check passed
[PASS] Admin user list passed
[PASS] Ticket creation passed (Ticket ID: 4)
[PASS] Ticket messaging passed
[PASS] Subscription upgrade passed
[PASS] AI Chatbot endpoint passed
[PASS] Knowledge base retrieval passed
[PASS] Dashboard metrics passed

ALL 12 INTEGRATION TESTS PASSED SUCCESSFULLY!
```

---

## ⚙️ Environment Variables

Configure `.env` in the `backend/` directory:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///./supportdesk.db` | Database connection URI (PostgreSQL or SQLite) |
| `SECRET_KEY` | `super-secret-jwt-key` | Secret key used for signing JWT tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT token validity window in minutes |
| `AI_PROVIDER` | `demo` | Provider engine (`demo`, `openai`, `gemini`) |
| `AI_API_KEY` | `""` | API key for external LLM provider |
| `AI_MODEL` | `gpt-4o-mini` | LLM model identifier |

---

## 🛡️ Security Features

* **Password Hashing**: Bcrypt with salted rounds.
* **Token Management**: Stateless JWT with strict claim decoding.
* **Role-Based Access Control (RBAC)**: Backend dependencies enforce allowed roles for each endpoint.
* **Resource Ownership**: Customers cannot access tickets or invoices belonging to other users.
* **Input Validation**: Pydantic models validate and sanitize all payloads.
* **Audit Trail**: Sensitive operations write to the `audit_logs` table.
