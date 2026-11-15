import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, 
    DateTime, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    AGENT = "agent"
    ADMIN = "admin"

class TicketCategory(str, enum.Enum):
    BILLING = "Billing"
    SUBSCRIPTION = "Subscription"
    PAYMENT_FAILURE = "Payment Failure"
    CANCELLATION = "Cancellation"
    REFUND = "Refund"
    TECHNICAL_ISSUE = "Technical Issue"
    ACCOUNT_ACCESS = "Account Access"
    OTHER = "Other"

class TicketPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"

class TicketStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    WAITING_FOR_CUSTOMER = "Waiting for Customer"
    RESOLVED = "Resolved"
    CLOSED = "Closed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.CUSTOMER.value, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    tickets = relationship("SupportTicket", back_populates="customer", foreign_keys="SupportTicket.user_id", cascade="all, delete-orphan")
    assigned_tickets = relationship("SupportTicket", back_populates="assigned_agent", foreign_keys="SupportTicket.assigned_agent_id")
    chat_conversations = relationship("ChatConversation", back_populates="user", cascade="all, delete-orphan")
    billing_records = relationship("BillingRecord", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="actor")

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    billing_interval = Column(String(20), default="month") # "month" or "year"
    features = Column(JSON, default=list) # Array of feature bullet strings
    is_active = Column(Boolean, default=True)

    subscriptions = relationship("Subscription", back_populates="plan")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False, index=True)
    status = Column(String(30), default="active") # active, canceled, past_due, paused
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    renewal_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    billing_records = relationship("BillingRecord", back_populates="subscription")

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(30), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_agent_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), default=TicketCategory.OTHER.value, nullable=False)
    priority = Column(String(20), default=TicketPriority.MEDIUM.value, nullable=False)
    status = Column(String(30), default=TicketStatus.OPEN.value, nullable=False)
    attachment_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    customer = relationship("User", back_populates="tickets", foreign_keys=[user_id])
    assigned_agent = relationship("User", back_populates="assigned_tickets", foreign_keys=[assigned_agent_id])
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan", order_by="TicketMessage.created_at")

class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    is_internal_note = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    ticket = relationship("SupportTicket", back_populates="messages")
    sender = relationship("User")

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), default="Support Conversation")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="chat_conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False) # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    is_demo_mode = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    conversation = relationship("ChatConversation", back_populates="messages")

class BillingRecord(Base):
    __tablename__ = "billing_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    plan_name = Column(String(100), default="Subscription Plan")
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    status = Column(String(30), default="Paid") # "Paid", "Pending", "Failed"
    billing_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    payment_method = Column(String(100), default="Simulated Visa (•••• 4242)")

    user = relationship("User", back_populates="billing_records")
    subscription = relationship("Subscription", back_populates="billing_records")

class KnowledgeBaseArticle(Base):
    __tablename__ = "knowledge_base_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False) # "Billing", "Subscriptions", "Account", "Technical"
    status = Column(String(20), default="published") # "published", "draft", "archived"
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    author = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(50), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    actor = relationship("User", back_populates="audit_logs")
