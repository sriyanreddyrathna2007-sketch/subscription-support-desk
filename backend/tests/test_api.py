import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.services.seed_service import seed_database

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_demo_customer():
    response = client.post("/api/auth/login", json={
        "email": "customer@demo.com",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "customer@demo.com"
    assert data["user"]["role"] == "customer"

def test_login_demo_agent():
    response = client.post("/api/auth/login", json={
        "email": "agent@demo.com",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "agent"

def test_login_demo_admin():
    response = client.post("/api/auth/login", json={
        "email": "admin@demo.com",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "admin"

def test_customer_ticket_ownership_and_creation():
    # Login customer
    login_resp = client.post("/api/auth/login", json={
        "email": "customer@demo.com",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create ticket
    create_resp = client.post("/api/tickets", headers=headers, json={
        "subject": "Need help with invoice download",
        "description": "I cannot download the PDF receipt for my last payment.",
        "category": "Billing",
        "priority": "Medium"
    })
    assert create_resp.status_code == 201
    ticket_data = create_resp.json()
    assert ticket_data["subject"] == "Need help with invoice download"
    ticket_id = ticket_data["id"]

    # Customer can access own ticket
    get_resp = client.get(f"/api/tickets/{ticket_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == ticket_id

    # Post reply
    reply_resp = client.post(f"/api/tickets/{ticket_id}/messages", headers=headers, json={
        "message": "It seems to be working now after clearing browser cache."
    })
    assert reply_resp.status_code == 200
    assert reply_resp.json()["message"] == "It seems to be working now after clearing browser cache."

def test_role_based_access_control():
    # Customer trying to access admin endpoint
    cust_login = client.post("/api/auth/login", json={
        "email": "customer@demo.com",
        "password": "Password123!"
    })
    cust_token = cust_login.json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    admin_resp = client.get("/api/admin/users", headers=cust_headers)
    assert admin_resp.status_code == 403

    # Admin accessing admin endpoint
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@demo.com",
        "password": "Password123!"
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    admin_resp2 = client.get("/api/admin/users", headers=admin_headers)
    assert admin_resp2.status_code == 200
    assert len(admin_resp2.json()) >= 3

def test_subscription_upgrade_workflow():
    cust_login = client.post("/api/auth/login", json={
        "email": "customer@demo.com",
        "password": "Password123!"
    })
    token = cust_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch available plans
    plans_resp = client.get("/api/plans")
    assert plans_resp.status_code == 200
    plans = plans_resp.json()
    assert len(plans) >= 3
    enterprise_plan = next(p for p in plans if p["name"] == "Enterprise")

    # Upgrade to Enterprise
    sub_resp = client.post("/api/subscriptions", headers=headers, json={
        "plan_id": enterprise_plan["id"]
    })
    assert sub_resp.status_code == 200
    sub_data = sub_resp.json()
    assert sub_data["plan_id"] == enterprise_plan["id"]

    # Verify billing record created
    billing_resp = client.get("/api/billing", headers=headers)
    assert billing_resp.status_code == 200
    records = billing_resp.json()
    assert any("Enterprise" in r["plan_name"] for r in records)

def test_ai_chat_and_demo_fallback():
    cust_login = client.post("/api/auth/login", json={
        "email": "customer@demo.com",
        "password": "Password123!"
    })
    token = cust_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Chat with question about failed payment
    chat_resp = client.post("/api/ai/chat", headers=headers, json={
        "message": "Why did my payment fail?"
    })
    assert chat_resp.status_code == 200
    data = chat_resp.json()
    assert "reply" in data
    assert data["is_demo_mode"] is True
    assert "failed payments" in data["reply"].lower() or "troubleshooting" in data["reply"].lower()
    assert data["suggest_ticket"] is True

def test_knowledge_base_retrieval():
    kb_resp = client.get("/api/knowledge-base?search=cancel")
    assert kb_resp.status_code == 200
    articles = kb_resp.json()
    assert len(articles) >= 1
    assert any("cancel" in a["title"].lower() for a in articles)
