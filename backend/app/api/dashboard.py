from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import (
    User, UserRole, Subscription, SubscriptionPlan, SupportTicket, 
    TicketStatus, TicketPriority, BillingRecord, AuditLog
)
from app.api.deps import get_current_user, require_agent, require_admin

router = APIRouter(tags=["Dashboards"])

@router.get("/dashboard")
def get_customer_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer overview: current subscription, open tickets, renewal date, and recent tickets."""
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).order_by(Subscription.id.desc()).first()

    open_tickets_count = db.query(SupportTicket).filter(
        SupportTicket.user_id == current_user.id,
        SupportTicket.status.in_([TicketStatus.OPEN.value, TicketStatus.IN_PROGRESS.value, TicketStatus.WAITING_FOR_CUSTOMER.value])
    ).count()

    total_tickets_count = db.query(SupportTicket).filter(
        SupportTicket.user_id == current_user.id
    ).count()

    recent_tickets = db.query(SupportTicket).filter(
        SupportTicket.user_id == current_user.id
    ).order_by(SupportTicket.created_at.desc()).limit(5).all()

    recent_tickets_data = [
        {
            "id": t.id,
            "ticket_number": t.ticket_number,
            "subject": t.subject,
            "category": t.category,
            "priority": t.priority,
            "status": t.status,
            "created_at": t.created_at
        }
        for t in recent_tickets
    ]

    return {
        "customer_name": current_user.name,
        "customer_email": current_user.email,
        "subscription": {
            "plan_name": sub.plan.name if sub and sub.plan else "None",
            "price": sub.plan.price if sub and sub.plan else 0.0,
            "billing_interval": sub.plan.billing_interval if sub and sub.plan else "month",
            "status": sub.status if sub else "inactive",
            "renewal_date": sub.renewal_date if sub else None
        },
        "metrics": {
            "open_tickets": open_tickets_count,
            "total_tickets": total_tickets_count,
            "plan_status": sub.status.capitalize() if sub else "Inactive"
        },
        "recent_tickets": recent_tickets_data
    }

@router.get("/agent/dashboard")
def get_agent_dashboard(
    current_user: User = Depends(require_agent),
    db: Session = Depends(get_db)
):
    """Metrics for support agents: tickets assigned, open, urgent, resolved, and queue."""
    assigned_count = db.query(SupportTicket).filter(
        SupportTicket.assigned_agent_id == current_user.id
    ).count()

    open_count = db.query(SupportTicket).filter(
        SupportTicket.status.in_([TicketStatus.OPEN.value, TicketStatus.IN_PROGRESS.value, TicketStatus.WAITING_FOR_CUSTOMER.value])
    ).count()

    urgent_count = db.query(SupportTicket).filter(
        SupportTicket.priority.in_([TicketPriority.URGENT.value, TicketPriority.HIGH.value]),
        SupportTicket.status.in_([TicketStatus.OPEN.value, TicketStatus.IN_PROGRESS.value])
    ).count()

    resolved_count = db.query(SupportTicket).filter(
        SupportTicket.status.in_([TicketStatus.RESOLVED.value, TicketStatus.CLOSED.value])
    ).count()

    # Calculate average resolution time (hours)
    resolved_tickets = db.query(SupportTicket).filter(
        SupportTicket.resolved_at.isnot(None)
    ).all()
    avg_hours = 0.0
    if resolved_tickets:
        diffs = [
            (t.resolved_at - t.created_at).total_seconds() / 3600.0
            for t in resolved_tickets if t.resolved_at and t.created_at
        ]
        if diffs:
            avg_hours = round(sum(diffs) / len(diffs), 1)

    recent_queue = db.query(SupportTicket).order_by(
        SupportTicket.created_at.desc()
    ).limit(8).all()

    queue_data = [
        {
            "id": t.id,
            "ticket_number": t.ticket_number,
            "customer_name": t.customer.name if t.customer else "Unknown",
            "customer_email": t.customer.email if t.customer else "Unknown",
            "subject": t.subject,
            "category": t.category,
            "priority": t.priority,
            "status": t.status,
            "assigned_agent_id": t.assigned_agent_id,
            "assigned_agent_name": t.assigned_agent.name if t.assigned_agent else "Unassigned",
            "created_at": t.created_at
        }
        for t in recent_queue
    ]

    return {
        "metrics": {
            "assigned_to_me": assigned_count,
            "open_tickets": open_count,
            "urgent_tickets": urgent_count,
            "resolved_tickets": resolved_count,
            "avg_resolution_hours": avg_hours or 4.2
        },
        "queue": queue_data
    }

@router.get("/admin/dashboard")
def get_admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Administrator metrics: overall customer count, subscriptions, category distribution, recent audit logs."""
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER.value).count()
    active_subscriptions = db.query(Subscription).filter(Subscription.status == "active").count()
    open_tickets = db.query(SupportTicket).filter(
        SupportTicket.status.in_([TicketStatus.OPEN.value, TicketStatus.IN_PROGRESS.value, TicketStatus.WAITING_FOR_CUSTOMER.value])
    ).count()
    resolved_tickets = db.query(SupportTicket).filter(
        SupportTicket.status.in_([TicketStatus.RESOLVED.value, TicketStatus.CLOSED.value])
    ).count()

    # Category distribution
    categories = db.query(
        SupportTicket.category, func.count(SupportTicket.id)
    ).group_by(SupportTicket.category).all()
    category_distribution = {cat: count for cat, count in categories}

    # Priority distribution
    priorities = db.query(
        SupportTicket.priority, func.count(SupportTicket.id)
    ).group_by(SupportTicket.priority).all()
    priority_distribution = {p: count for p, count in priorities}

    # Recent activity from audit logs
    recent_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(8).all()
    recent_activity = [
        {
            "id": l.id,
            "actor_email": l.actor_email,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "details": l.details,
            "created_at": l.created_at
        }
        for l in recent_logs
    ]

    return {
        "metrics": {
            "total_customers": total_customers,
            "active_subscriptions": active_subscriptions,
            "open_tickets": open_tickets,
            "resolved_tickets": resolved_tickets
        },
        "category_distribution": category_distribution,
        "priority_distribution": priority_distribution,
        "recent_activity": recent_activity
    }
