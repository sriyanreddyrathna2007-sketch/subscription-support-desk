import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.models import SupportTicket, TicketMessage, User, UserRole, TicketStatus
from app.schemas.schemas import (
    TicketCreate, TicketUpdate, TicketOut, TicketMessageCreate, TicketMessageOut
)
from app.api.deps import get_current_user, log_audit

router = APIRouter(prefix="/tickets", tags=["Support Tickets"])

def format_ticket_out(ticket: SupportTicket) -> TicketOut:
    messages_out = []
    for m in ticket.messages:
        messages_out.append(TicketMessageOut(
            id=m.id,
            ticket_id=m.ticket_id,
            sender_id=m.sender_id,
            sender_name=m.sender.name if m.sender else "Support",
            sender_role=m.sender.role if m.sender else "customer",
            message=m.message,
            is_internal_note=m.is_internal_note,
            created_at=m.created_at
        ))
    
    return TicketOut(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        user_id=ticket.user_id,
        customer_name=ticket.customer.name if ticket.customer else "Unknown",
        customer_email=ticket.customer.email if ticket.customer else "Unknown",
        assigned_agent_id=ticket.assigned_agent_id,
        assigned_agent_name=ticket.assigned_agent.name if ticket.assigned_agent else None,
        subject=ticket.subject,
        description=ticket.description,
        category=ticket.category,
        priority=ticket.priority,
        status=ticket.status,
        attachment_name=ticket.attachment_name,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        resolved_at=ticket.resolved_at,
        messages=messages_out
    )

@router.post("", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer or agent creates a new support ticket."""
    ticket_number = f"TICK-{random.randint(1000, 9999)}"
    # Ensure unique ticket number
    while db.query(SupportTicket).filter(SupportTicket.ticket_number == ticket_number).first():
        ticket_number = f"TICK-{random.randint(1000, 9999)}"

    ticket = SupportTicket(
        ticket_number=ticket_number,
        user_id=current_user.id,
        subject=ticket_in.subject.strip(),
        description=ticket_in.description.strip(),
        category=ticket_in.category,
        priority=ticket_in.priority,
        status=TicketStatus.OPEN.value,
        attachment_name=ticket_in.attachment_name,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # Add initial customer message to conversation thread
    initial_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=ticket_in.description.strip(),
        created_at=ticket.created_at
    )
    db.add(initial_msg)
    db.commit()
    db.refresh(ticket)

    log_audit(
        db, current_user, "TICKET_CREATED", "SupportTicket", str(ticket.id),
        {"ticket_number": ticket.ticket_number, "subject": ticket.subject, "priority": ticket.priority}
    )

    return format_ticket_out(ticket)

@router.get("", response_model=List[TicketOut])
def list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    category_filter: Optional[str] = Query(None, alias="category"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List tickets with filtering. Customers only see their own tickets."""
    query = db.query(SupportTicket)

    # Customers only see their own tickets
    if current_user.role == UserRole.CUSTOMER.value:
        query = query.filter(SupportTicket.user_id == current_user.id)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(SupportTicket.status == status_filter)

    if category_filter and category_filter.lower() != "all":
        query = query.filter(SupportTicket.category == category_filter)

    if priority_filter and priority_filter.lower() != "all":
        query = query.filter(SupportTicket.priority == priority_filter)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                SupportTicket.ticket_number.ilike(term),
                SupportTicket.subject.ilike(term),
                SupportTicket.description.ilike(term)
            )
        )

    tickets = query.order_by(SupportTicket.created_at.desc()).all()
    return [format_ticket_out(t) for t in tickets]

@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single ticket details with full message history."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")

    # Authorization check
    if current_user.role == UserRole.CUSTOMER.value and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: You can only view your own tickets")

    return format_ticket_out(ticket)

@router.post("/{ticket_id}/messages", response_model=TicketMessageOut)
def add_ticket_message(
    ticket_id: int,
    msg_in: TicketMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add reply to a support ticket thread."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")

    # Authorization
    if current_user.role == UserRole.CUSTOMER.value and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this ticket")

    msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=msg_in.message.strip(),
        is_internal_note=msg_in.is_internal_note if current_user.role in [UserRole.AGENT.value, UserRole.ADMIN.value] else False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(msg)

    # Status updates automatically on reply
    if current_user.role == UserRole.CUSTOMER.value:
        if ticket.status in [TicketStatus.RESOLVED.value, TicketStatus.WAITING_FOR_CUSTOMER.value]:
            ticket.status = TicketStatus.IN_PROGRESS.value
    elif current_user.role in [UserRole.AGENT.value, UserRole.ADMIN.value]:
        if not msg_in.is_internal_note and ticket.status == TicketStatus.OPEN.value:
            ticket.status = TicketStatus.IN_PROGRESS.value

    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(msg)

    log_audit(
        db, current_user, "TICKET_MESSAGE_ADDED", "TicketMessage", str(msg.id),
        {"ticket_id": ticket.id, "ticket_number": ticket.ticket_number}
    )

    return TicketMessageOut(
        id=msg.id,
        ticket_id=msg.ticket_id,
        sender_id=msg.sender_id,
        sender_name=current_user.name,
        sender_role=current_user.role,
        message=msg.message,
        is_internal_note=msg.is_internal_note,
        created_at=msg.created_at
    )

@router.patch("/{ticket_id}", response_model=TicketOut)
def update_ticket(
    ticket_id: int,
    ticket_update: TicketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update ticket status, priority, or assigned agent."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")

    # If customer, can only update status to Closed or Resolved
    if current_user.role == UserRole.CUSTOMER.value:
        if ticket.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        if ticket_update.status and ticket_update.status not in [TicketStatus.CLOSED.value, TicketStatus.RESOLVED.value]:
            raise HTTPException(status_code=403, detail="Customers can only close or resolve their tickets")
        if ticket_update.priority or ticket_update.assigned_agent_id:
            raise HTTPException(status_code=403, detail="Customers cannot change priority or assign agents")

    if ticket_update.status is not None:
        ticket.status = ticket_update.status
        if ticket_update.status in [TicketStatus.RESOLVED.value, TicketStatus.CLOSED.value]:
            ticket.resolved_at = datetime.now(timezone.utc)
        else:
            ticket.resolved_at = None

    if ticket_update.priority is not None and current_user.role in [UserRole.AGENT.value, UserRole.ADMIN.value]:
        ticket.priority = ticket_update.priority

    if ticket_update.assigned_agent_id is not None and current_user.role in [UserRole.AGENT.value, UserRole.ADMIN.value]:
        if ticket_update.assigned_agent_id > 0:
            agent = db.query(User).filter(
                User.id == ticket_update.assigned_agent_id,
                User.role.in_([UserRole.AGENT.value, UserRole.ADMIN.value])
            ).first()
            if not agent:
                raise HTTPException(status_code=400, detail="Assigned user is not an authorized support agent")
            ticket.assigned_agent_id = agent.id
        else:
            ticket.assigned_agent_id = None

    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ticket)

    log_audit(
        db, current_user, "TICKET_UPDATED", "SupportTicket", str(ticket.id),
        {"status": ticket.status, "priority": ticket.priority, "assigned_agent_id": ticket.assigned_agent_id}
    )

    return format_ticket_out(ticket)
