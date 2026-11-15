import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import httpx
from app.main import app

def test_endpoints():
    async def _test():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Health check
            r = await client.get("/api/health")
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            assert r.json()["status"] == "healthy"
            print("[PASS] Health check passed")

            # 2. Customer login
            r = await client.post("/api/auth/login", json={
                "email": "customer@demo.com",
                "password": "Password123!"
            })
            assert r.status_code == 200, f"Customer login failed: {r.text}"
            cust_token = r.json()["access_token"]
            cust_headers = {"Authorization": f"Bearer {cust_token}"}
            print("[PASS] Customer login passed")

            # 3. Agent login
            r = await client.post("/api/auth/login", json={
                "email": "agent@demo.com",
                "password": "Password123!"
            })
            assert r.status_code == 200
            assert r.json()["user"]["role"] == "agent"
            print("[PASS] Agent login passed")

            # 4. Admin login
            r = await client.post("/api/auth/login", json={
                "email": "admin@demo.com",
                "password": "Password123!"
            })
            assert r.status_code == 200
            assert r.json()["user"]["role"] == "admin"
            admin_token = r.json()["access_token"]
            admin_headers = {"Authorization": f"Bearer {admin_token}"}
            print("[PASS] Admin login passed")

            # 5. Role restrictions: Customer cannot view admin users
            r = await client.get("/api/admin/users", headers=cust_headers)
            assert r.status_code == 403, f"Expected 403, got {r.status_code}"
            print("[PASS] Role RBAC check passed")

            # 6. Admin can view users
            r = await client.get("/api/admin/users", headers=admin_headers)
            assert r.status_code == 200
            assert len(r.json()) >= 3
            print("[PASS] Admin user list passed")

            # 7. Create ticket
            r = await client.post("/api/tickets", headers=cust_headers, json={
                "subject": "Need invoice clarification",
                "description": "I would like to verify my monthly subscription tax breakdown.",
                "category": "Billing",
                "priority": "Low"
            })
            assert r.status_code == 201
            ticket_id = r.json()["id"]
            print(f"[PASS] Ticket creation passed (Ticket ID: {ticket_id})")

            # 8. Customer adds message to ticket
            r = await client.post(f"/api/tickets/{ticket_id}/messages", headers=cust_headers, json={
                "message": "Here are the additional details about our business registration."
            })
            assert r.status_code == 200
            print("[PASS] Ticket messaging passed")

            # 9. List plans & upgrade subscription
            r = await client.get("/api/plans")
            assert r.status_code == 200
            plans = r.json()
            pro_plan = next(p for p in plans if p["name"] == "Pro")
            r = await client.post("/api/subscriptions", headers=cust_headers, json={
                "plan_id": pro_plan["id"]
            })
            assert r.status_code == 200
            assert r.json()["plan_id"] == pro_plan["id"]
            print("[PASS] Subscription upgrade passed")

            # 10. AI Chatbot demo response
            r = await client.post("/api/ai/chat", headers=cust_headers, json={
                "message": "Why did my payment fail?"
            })
            assert r.status_code == 200
            ai_data = r.json()
            assert ai_data["is_demo_mode"] is True
            assert len(ai_data["reply"]) > 20
            print("[PASS] AI Chatbot endpoint passed")

            # 11. Knowledge base
            r = await client.get("/api/knowledge-base")
            assert r.status_code == 200
            assert len(r.json()) >= 5
            print("[PASS] Knowledge base retrieval passed")

            # 12. Dashboards
            r = await client.get("/api/dashboard", headers=cust_headers)
            assert r.status_code == 200
            r = await client.get("/api/admin/dashboard", headers=admin_headers)
            assert r.status_code == 200
            print("[PASS] Dashboard metrics passed")

    asyncio.run(_test())

if __name__ == "__main__":
    test_endpoints()
    print("\nALL 12 INTEGRATION TESTS PASSED SUCCESSFULLY!")
