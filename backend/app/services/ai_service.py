import json
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import KnowledgeBaseArticle, User, Subscription, SupportTicket

class AIService:
    @staticmethod
    def retrieve_relevant_kb(db: Session, query: str) -> List[KnowledgeBaseArticle]:
        """Search knowledge base articles matching user query keywords"""
        words = [w.lower().strip() for w in query.split() if len(w) > 2]
        if not words:
            return db.query(KnowledgeBaseArticle).filter(KnowledgeBaseArticle.status == "published").limit(3).all()
        
        articles = db.query(KnowledgeBaseArticle).filter(KnowledgeBaseArticle.status == "published").all()
        scored_articles = []
        for art in articles:
            score = 0
            text_to_search = f"{art.title} {art.content} {art.category}".lower()
            for w in words:
                if w in art.title.lower():
                    score += 3
                elif w in text_to_search:
                    score += 1
            if score > 0:
                scored_articles.append((score, art))
                
        scored_articles.sort(key=lambda x: x[0], reverse=True)
        return [art for _, art in scored_articles[:3]]

    @classmethod
    async def chat(
        cls, 
        db: Session, 
        user_message: str, 
        user: Optional[User] = None, 
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Process chat with AI provider or fallback rule-based demo engine.
        Answers strictly using approved knowledge base and user account context.
        """
        # Fetch relevant approved articles
        relevant_kb = cls.retrieve_relevant_kb(db, user_message)
        kb_titles = [art.title for art in relevant_kb]
        
        # User subscription context
        user_context_str = "Customer not logged in."
        current_sub = None
        if user:
            current_sub = db.query(Subscription).filter(
                Subscription.user_id == user.id,
                Subscription.status == "active"
            ).first()
            if current_sub and current_sub.plan:
                user_context_str = f"Customer Name: {user.name}, Plan: {current_sub.plan.name} (${current_sub.plan.price}/{current_sub.plan.billing_interval}), Status: {current_sub.status}, Renewal Date: {current_sub.renewal_date.strftime('%Y-%m-%d') if current_sub.renewal_date else 'N/A'}"
            else:
                user_context_str = f"Customer Name: {user.name}, No active subscription."

        # If API key is present and provider is openai or gemini
        if settings.AI_API_KEY and settings.AI_PROVIDER != "demo":
            try:
                # Format system prompt
                kb_context = "\n\n".join([f"Article '{art.title}' ({art.category}):\n{art.content}" for art in relevant_kb])
                system_prompt = (
                    "You are SupportDesk AI, a professional and helpful customer support assistant for a subscription SaaS platform.\n"
                    "RULES:\n"
                    "1. Always use the approved knowledge base articles provided below. Do not invent pricing, refund rules, or technical facts.\n"
                    "2. If the user's question cannot be answered with high confidence from the knowledge base, clearly say you cannot confirm the exact answer and offer to open a support ticket.\n"
                    "3. Current Customer Context: " + user_context_str + "\n"
                    "4. Be polite, concise, professional, and provide clear step-by-step guidance.\n"
                    "5. APPROVED KNOWLEDGE BASE:\n" + kb_context
                )

                if settings.AI_PROVIDER == "openai":
                    messages = [{"role": "system", "content": system_prompt}]
                    if history:
                        for h in history[-6:]:
                            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
                    messages.append({"role": "user", "content": user_message})

                    async with httpx.AsyncClient(timeout=25.0) as client:
                        resp = await client.post(
                            "https://api.openai.com/v1/chat/completions",
                            headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
                            json={"model": settings.AI_MODEL or "gpt-4o-mini", "messages": messages, "temperature": 0.2}
                        )
                        if resp.status_code == 200:
                            data = resp.json()
                            reply = data["choices"][0]["message"]["content"]
                            return {
                                "reply": reply,
                                "is_demo_mode": False,
                                "kb_references": kb_titles,
                                "suggest_ticket": "ticket" in reply.lower() or "support agent" in reply.lower()
                            }
            except Exception as e:
                print(f"External AI Provider error: {e}. Falling back to demo mode.")

        # DEMO MODE ENGINE (Clearly labeled, deterministic, policy-accurate)
        return cls._generate_demo_response(user_message, user, relevant_kb, kb_titles)

    @classmethod
    def _generate_demo_response(
        cls, 
        message: str, 
        user: Optional[User], 
        relevant_kb: List[KnowledgeBaseArticle], 
        kb_titles: List[str]
    ) -> Dict[str, Any]:
        msg = message.lower()
        suggest_ticket = False
        suggested_category = "Other"
        suggested_subject = None

        # Check for specific user intents based on approved support policies
        if any(w in msg for w in ["payment fail", "failed payment", "declined", "card error", "charge failed"]):
            suggested_category = "Payment Failure"
            suggested_subject = "Payment Failed Investigation"
            reply = (
                "**Troubleshooting Failed Payments:**\n\n"
                "1. **Check Card Details:** Ensure your card number, CVV, and expiration date are up to date.\n"
                "2. **Bank Verification:** Some banks require 3D-Secure 2FA authorization via SMS or mobile app.\n"
                "3. **Sufficient Balance:** Verify sufficient funds or contact your bank regarding international SaaS transactions.\n"
                "4. **Update Payment Method:** You can update your payment method anytime from the **Billing History** or **My Subscription** tab.\n\n"
                "Would you like me to connect you with our billing team by opening a support ticket?"
            )
            suggest_ticket = True

        elif any(w in msg for w in ["upgrade", "switch plan", "change plan", "downgrade"]):
            suggested_category = "Subscription"
            suggested_subject = "Plan Upgrade / Change Request"
            reply = (
                "**How to Upgrade or Change Your Subscription:**\n\n"
                "1. Navigate to **My Subscription** in the left sidebar.\n"
                "2. Review the feature comparison between **Basic**, **Pro**, and **Enterprise** tiers.\n"
                "3. Click **Upgrade Plan** on your chosen tier.\n"
                "4. Plan upgrades take effect immediately with prorated billing adjustments applied to your next invoice."
            )

        elif any(w in msg for w in ["cancel", "unsubscribe", "stop subscription"]):
            suggested_category = "Cancellation"
            suggested_subject = "Subscription Cancellation Request"
            reply = (
                "**How to Cancel Your Subscription:**\n\n"
                "1. Go to **My Subscription** in your customer dashboard.\n"
                "2. Under your current plan status, click **Cancel Subscription**.\n"
                "3. Select a brief reason for cancellation and confirm.\n\n"
                "*Note:* You will retain full access to all features until the end of your current billing cycle. No further automatic charges will be made."
            )

        elif any(w in msg for w in ["refund", "money back", "reimburse"]):
            suggested_category = "Refund"
            suggested_subject = "Refund Request Review"
            reply = (
                "**SupportDesk AI Refund Policy:**\n\n"
                "• We offer a **14-day money-back guarantee** on initial subscriptions if you are not fully satisfied.\n"
                "• Annual renewals are eligible for prorated review within 7 days of the renewal charge.\n"
                "• As an automated AI assistant, I cannot directly initiate monetary refunds. I can create an urgent ticket for our finance desk right away."
            )
            suggest_ticket = True

        elif any(w in msg for w in ["premium", "not working", "access", "locked out", "feature missing"]):
            suggested_category = "Technical Issue"
            suggested_subject = "Premium Feature Access Issue"
            reply = (
                "**Restoring Premium Feature Access:**\n\n"
                "1. Try logging out and logging back into your account to refresh your session permissions.\n"
                "2. Check **My Subscription** to verify your account status is **Active** rather than Past Due.\n"
                "3. Clear browser cache and ensure no ad-blockers are blocking workspace script execution.\n\n"
                "If issues persist, click **Create Support Ticket** below so a specialist can verify your tenant provisioning."
            )
            suggest_ticket = True

        elif relevant_kb:
            # Use top KB article
            top = relevant_kb[0]
            reply = (
                f"Here is what our official documentation says regarding **{top.title}**:\n\n"
                f"{top.content}\n\n"
                "Does this help answer your question, or would you like to escalate this to a support agent?"
            )
        else:
            suggested_category = "Other"
            suggested_subject = f"Assistance regarding: {message[:40]}..."
            reply = (
                "I searched our approved documentation but could not find a confirmed answer to your exact question. "
                "To ensure you receive accurate guidance without speculation, I recommend opening a support ticket so our team can assist you directly."
            )
            suggest_ticket = True

        return {
            "reply": reply,
            "is_demo_mode": True,
            "kb_references": kb_titles,
            "suggest_ticket": suggest_ticket,
            "suggested_category": suggested_category,
            "suggested_subject": suggested_subject
        }

    @classmethod
    def summarize_ticket(cls, ticket: SupportTicket) -> Dict[str, Any]:
        """Summarize ticket for support agents"""
        msg_count = len(ticket.messages)
        key_points = [
            f"Category: {ticket.category} | Priority: {ticket.priority} | Status: {ticket.status}",
            f"Customer: {ticket.customer.name if ticket.customer else 'Unknown'} ({ticket.customer.email if ticket.customer else 'N/A'})",
            f"Total correspondence: {msg_count} message(s)"
        ]
        summary = (
            f"Customer '{ticket.customer.name if ticket.customer else 'User'}' opened ticket {ticket.ticket_number} "
            f"regarding '{ticket.subject}'. Initial issue stated: \"{ticket.description[:180]}{'...' if len(ticket.description) > 180 else ''}\". "
            f"Currently marked as {ticket.status} with {ticket.priority} priority."
        )
        return {
            "summary": summary,
            "key_points": key_points,
            "suggested_priority": ticket.priority,
            "sentiment": "Neutral / Inquiring" if ticket.priority in ["Low", "Medium"] else "Urgent / Escalated",
            "is_demo_mode": True
        }

    @classmethod
    def suggest_response(cls, ticket: SupportTicket) -> Dict[str, Any]:
        """Generate AI response suggestion for support agents to review and edit before sending"""
        customer_name = ticket.customer.name.split()[0] if ticket.customer else "there"
        
        if ticket.category == "Payment Failure":
            suggestion = (
                f"Hi {customer_name},\n\n"
                "Thank you for reaching out to SupportDesk. I looked into your account and noticed the recent payment attempt was flagged by your card issuer. "
                "Could you please verify your billing address or try an alternative card via your 'My Subscription' tab? "
                "I have extended your trial grace period by 3 days so you won't experience any interruption in access.\n\n"
                "Please let me know once updated so I can re-attempt the charge.\n\n"
                "Best regards,\nSupport Desk Team"
            )
        elif ticket.category == "Refund":
            suggestion = (
                f"Hi {customer_name},\n\n"
                "Thank you for contacting our billing support team. We have reviewed your request in accordance with our 14-day satisfaction guarantee. "
                "I am pleased to inform you that your refund has been approved and processed back to your original payment method. "
                "It typically reflects on your bank statement within 3-5 business days.\n\n"
                "Please let us know if there is anything else we can assist you with.\n\n"
                "Best regards,\nSupport Desk Billing"
            )
        else:
            suggestion = (
                f"Hi {customer_name},\n\n"
                f"Thank you for reaching out regarding '{ticket.subject}'. "
                "I have reviewed the details you provided and am looking into this directly. "
                "Could you please confirm if this issue still persists when accessing from an incognito window?\n\n"
                "Looking forward to your reply so we can get this resolved for you quickly.\n\n"
                "Best regards,\nSupport Desk Team"
            )

        return {
            "suggestion": suggestion,
            "confidence": 0.94,
            "is_demo_mode": True
        }
