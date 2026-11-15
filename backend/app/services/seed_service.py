from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.models import (
    User, UserRole, SubscriptionPlan, Subscription, 
    SupportTicket, TicketMessage, TicketCategory, TicketPriority, TicketStatus,
    BillingRecord, KnowledgeBaseArticle, AuditLog
)

def seed_database(db: Session):
    """Seed demo accounts, plans, knowledge base, tickets, and billing records."""
    # Check if already seeded
    admin_user = db.query(User).filter(User.email == "admin@demo.com").first()
    if admin_user:
        return

    print("Seeding initial database records...")

    # 1. Create Users
    default_pw = get_password_hash("Password123!")

    customer = User(
        name="Alex Mercer",
        email="customer@demo.com",
        password_hash=default_pw,
        role=UserRole.CUSTOMER.value,
        created_at=datetime.now(timezone.utc) - timedelta(days=60)
    )
    agent = User(
        name="Sarah Jenkins",
        email="agent@demo.com",
        password_hash=default_pw,
        role=UserRole.AGENT.value,
        created_at=datetime.now(timezone.utc) - timedelta(days=90)
    )
    admin = User(
        name="Marcus Vance",
        email="admin@demo.com",
        password_hash=default_pw,
        role=UserRole.ADMIN.value,
        created_at=datetime.now(timezone.utc) - timedelta(days=120)
    )
    db.add_all([customer, agent, admin])
    db.commit()
    db.refresh(customer)
    db.refresh(agent)
    db.refresh(admin)

    # 2. Create Subscription Plans
    basic_plan = SubscriptionPlan(
        name="Basic",
        description="Essential features for individuals and small teams.",
        price=19.00,
        billing_interval="month",
        features=[
            "1 Team Workspace",
            "Standard Email Support",
            "Up to 50 AI Assistant queries / mo",
            "Monthly billing cycle",
            "Community knowledge access"
        ],
        is_active=True
    )
    pro_plan = SubscriptionPlan(
        name="Pro",
        description="Priority support and expanded limits for growing teams.",
        price=49.00,
        billing_interval="month",
        features=[
            "Unlimited Workspaces",
            "Priority Support Desk queue (4h SLA)",
            "Unlimited AI Assistant chats",
            "Custom domain & webhooks",
            "Advanced billing & invoice management",
            "Audit log export"
        ],
        is_active=True
    )
    enterprise_plan = SubscriptionPlan(
        name="Enterprise",
        description="Dedicated SLA, account management, and custom solutions.",
        price=199.00,
        billing_interval="month",
        features=[
            "Dedicated Support Account Manager",
            "1-hour Guaranteed Response SLA",
            "Fine-tuned AI model integrations",
            "SSO, SAML & Enterprise RBAC",
            "Custom billing & invoicing terms",
            "99.99% Uptime Guarantee"
        ],
        is_active=True
    )
    db.add_all([basic_plan, pro_plan, enterprise_plan])
    db.commit()
    db.refresh(pro_plan)
    db.refresh(basic_plan)
    db.refresh(enterprise_plan)

    # 3. Customer Active Subscription
    renewal_dt = datetime.now(timezone.utc) + timedelta(days=18)
    sub = Subscription(
        user_id=customer.id,
        plan_id=pro_plan.id,
        status="active",
        started_at=datetime.now(timezone.utc) - timedelta(days=42),
        renewal_date=renewal_dt
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    # 4. Billing Records
    inv1 = BillingRecord(
        user_id=customer.id,
        subscription_id=sub.id,
        invoice_number="INV-2026-00101",
        plan_name="Pro Plan - Monthly",
        amount=49.00,
        currency="USD",
        status="Paid",
        billing_date=datetime.now(timezone.utc) - timedelta(days=42),
        payment_method="Simulated Visa (•••• 4242)"
    )
    inv2 = BillingRecord(
        user_id=customer.id,
        subscription_id=sub.id,
        invoice_number="INV-2026-00188",
        plan_name="Pro Plan - Monthly Renewal",
        amount=49.00,
        currency="USD",
        status="Paid",
        billing_date=datetime.now(timezone.utc) - timedelta(days=12),
        payment_method="Simulated Visa (•••• 4242)"
    )
    db.add_all([inv1, inv2])

    # 5. Knowledge Base Articles
    articles = [
        KnowledgeBaseArticle(
            title="How to change or upgrade your subscription plan",
            category="Subscriptions",
            status="published",
            created_by=admin.id,
            content=(
                "You can change your subscription tier at any time from your customer dashboard.\n\n"
                "1. Go to 'My Subscription' on the navigation sidebar.\n"
                "2. Browse available tiers: Basic ($19/mo), Pro ($49/mo), or Enterprise ($199/mo).\n"
                "3. Click 'Upgrade Plan' or 'Switch Plan' on your preferred option.\n"
                "4. Upgrades take effect immediately. Prorated charges or credits will be automatically calculated on your next billing statement."
            )
        ),
        KnowledgeBaseArticle(
            title="Troubleshooting failed payments and declined cards",
            category="Billing",
            status="published",
            created_by=admin.id,
            content=(
                "If a subscription payment fails, our billing engine attempts 3 retries over 5 business days.\n\n"
                "Common reasons for card payment failures:\n"
                "• Insufficient funds or card expiration.\n"
                "• Bank security blocking recurring international online charges.\n"
                "• 3D-Secure 2FA verification timeout.\n\n"
                "To resolve: Navigate to 'My Subscription' or 'Billing History' and enter updated card credentials. "
                "Once updated, our system will immediately re-attempt processing without service disruption."
            )
        ),
        KnowledgeBaseArticle(
            title="Subscription cancellation and renewal policies",
            category="Subscriptions",
            status="published",
            created_by=admin.id,
            content=(
                "We believe in straightforward subscription terms with zero hidden exit hurdles.\n\n"
                "• You may cancel anytime by clicking 'Cancel Subscription' on the My Subscription page.\n"
                "• After cancellation, you maintain full access to all features until your current billing period concludes.\n"
                "• No further automated renewals will take place after cancellation is registered.\n"
                "• You can reactivate an expiring subscription at any point prior to the period expiration date."
            )
        ),
        KnowledgeBaseArticle(
            title="Refund requests and satisfaction guarantee policy",
            category="Billing",
            status="published",
            created_by=admin.id,
            content=(
                "SupportDesk AI provides a transparent 14-day money-back guarantee for first-time plan subscriptions.\n\n"
                "• Requests submitted within 14 calendar days of initial sign-up receive a 100% full refund.\n"
                "• Annual plan renewals are eligible for cancellation and prorated review within 7 days of billing.\n"
                "• To initiate a refund review, open a ticket with category 'Refund' or contact our billing specialists directly."
            )
        ),
        KnowledgeBaseArticle(
            title="Restoring premium account access and troubleshooting permissions",
            category="Account Access",
            status="published",
            created_by=admin.id,
            content=(
                "If your account suddenly lacks expected premium feature access:\n\n"
                "1. Check if your subscription has entered 'Past Due' status due to an overdue billing charge.\n"
                "2. Perform a complete logout and sign back in to refresh your role tokens.\n"
                "3. Verify that your organization administrator hasn't reassigned your member seat.\n"
                "4. If your plan is Active but features remain locked, create a ticket with category 'Technical Issue'."
            )
        ),
        KnowledgeBaseArticle(
            title="Contacting customer support and SLA guidelines",
            category="Technical",
            status="published",
            created_by=admin.id,
            content=(
                "Our support engineering team operates 24/7 across multiple timezones.\n\n"
                "Response SLAs:\n"
                "• Basic tier: Within 24 business hours.\n"
                "• Pro tier: Within 4 business hours.\n"
                "• Enterprise tier: Within 1 hour (24/7 priority pager).\n\n"
                "For instantaneous guidance, our AI Assistant is available 24/7 directly in your dashboard."
            )
        )
    ]
    db.add_all(articles)
    db.commit()

    # 6. Sample Support Tickets
    ticket1 = SupportTicket(
        ticket_number="TICK-1001",
        user_id=customer.id,
        assigned_agent_id=agent.id,
        subject="Card charged twice during plan upgrade checkout",
        description="I upgraded to the Pro plan yesterday and noticed two duplicate charges of $49 appear on my online banking statement. Please verify and refund the extra charge.",
        category=TicketCategory.BILLING.value,
        priority=TicketPriority.HIGH.value,
        status=TicketStatus.IN_PROGRESS.value,
        created_at=datetime.now(timezone.utc) - timedelta(days=2, hours=4)
    )
    ticket2 = SupportTicket(
        ticket_number="TICK-1002",
        user_id=customer.id,
        assigned_agent_id=agent.id,
        subject="Inquiry regarding annual prepayment discount",
        description="Our team is interested in locking in the Pro tier for an entire year. Do you provide an annual billing discount or custom invoicing for tax compliance?",
        category=TicketCategory.SUBSCRIPTION.value,
        priority=TicketPriority.LOW.value,
        status=TicketStatus.RESOLVED.value,
        created_at=datetime.now(timezone.utc) - timedelta(days=10),
        resolved_at=datetime.now(timezone.utc) - timedelta(days=8)
    )
    ticket3 = SupportTicket(
        ticket_number="TICK-1003",
        user_id=customer.id,
        assigned_agent_id=None,
        subject="Webhook delivery timeouts on invoice.paid event",
        description="Our webhook listener at api.company.io is receiving intermittent 504 gateway timeouts when processing the invoice.paid events.",
        category=TicketCategory.TECHNICAL_ISSUE.value,
        priority=TicketPriority.URGENT.value,
        status=TicketStatus.OPEN.value,
        created_at=datetime.now(timezone.utc) - timedelta(hours=3)
    )
    db.add_all([ticket1, ticket2, ticket3])
    db.commit()
    db.refresh(ticket1)
    db.refresh(ticket2)

    # 7. Messages on Ticket 1
    m1 = TicketMessage(
        ticket_id=ticket1.id,
        sender_id=customer.id,
        message="I upgraded to the Pro plan yesterday and noticed two duplicate charges of $49 appear on my online banking statement. Please verify and refund the extra charge.",
        created_at=ticket1.created_at
    )
    m2 = TicketMessage(
        ticket_id=ticket1.id,
        sender_id=agent.id,
        message="Hello Alex, thank you for alerting us. I have investigated your transaction ledger and confirmed the duplicate authorization. I have submitted an immediate void transaction for the secondary $49 charge. It should release on your bank within 2 business days.",
        created_at=ticket1.created_at + timedelta(hours=1, minutes=20)
    )
    db.add_all([m1, m2])

    # 8. Audit Logs
    db.add(AuditLog(
        actor_user_id=customer.id,
        actor_email=customer.email,
        action="SUBSCRIPTION_UPGRADE",
        resource_type="Subscription",
        resource_id=str(sub.id),
        details={"from_plan": "Basic", "to_plan": "Pro", "price": 49.00},
        created_at=datetime.now(timezone.utc) - timedelta(days=42)
    ))
    db.add(AuditLog(
        actor_user_id=agent.id,
        actor_email=agent.email,
        action="TICKET_STATUS_UPDATE",
        resource_type="SupportTicket",
        resource_id=str(ticket1.id),
        details={"status": "In Progress", "assigned_agent": agent.name},
        created_at=datetime.now(timezone.utc) - timedelta(days=2)
    ))

    db.commit()
    print("Database seeding completed successfully.")
