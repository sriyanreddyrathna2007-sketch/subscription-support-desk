from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# User schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)
    role: Optional[str] = "customer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserRoleUpdate(BaseModel):
    role: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Subscription Plan schemas
class SubscriptionPlanBase(BaseModel):
    name: str
    description: str
    price: float
    billing_interval: str = "month"
    features: List[str] = []
    is_active: bool = True

class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    billing_interval: Optional[str] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None

class SubscriptionPlanOut(SubscriptionPlanBase):
    id: int

    class Config:
        from_attributes = True

# Subscription schemas
class SubscriptionOut(BaseModel):
    id: int
    user_id: int
    plan_id: int
    status: str
    started_at: datetime
    renewal_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    plan: Optional[SubscriptionPlanOut] = None

    class Config:
        from_attributes = True

class SubscriptionChangeRequest(BaseModel):
    plan_id: int

class SubscriptionCancelRequest(BaseModel):
    reason: Optional[str] = "Customer requested cancellation"

# Ticket Message schemas
class TicketMessageCreate(BaseModel):
    message: str = Field(..., min_length=1)
    is_internal_note: bool = False

class TicketMessageOut(BaseModel):
    id: int
    ticket_id: int
    sender_id: int
    sender_name: Optional[str] = None
    sender_role: Optional[str] = None
    message: str
    is_internal_note: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

# Support Ticket schemas
class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    category: str = "Other"
    priority: str = "Medium"
    attachment_name: Optional[str] = None

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_agent_id: Optional[int] = None

class TicketOut(BaseModel):
    id: int
    ticket_number: str
    user_id: int
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    assigned_agent_id: Optional[int] = None
    assigned_agent_name: Optional[str] = None
    subject: str
    description: str
    category: str
    priority: str
    status: str
    attachment_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    messages: List[TicketMessageOut] = []

    class Config:
        from_attributes = True

# Billing Record schemas
class BillingRecordOut(BaseModel):
    id: int
    user_id: int
    subscription_id: Optional[int] = None
    invoice_number: str
    plan_name: str
    amount: float
    currency: str
    status: str
    billing_date: datetime
    payment_method: str

    class Config:
        from_attributes = True

# Knowledge Base schemas
class KBArticleCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=10)
    category: str
    status: str = "published"

class KBArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None

class KBArticleOut(BaseModel):
    id: int
    title: str
    content: str
    category: str
    status: str
    created_by: Optional[int] = None
    author_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# AI Chat schemas
class ChatMessageIn(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    reply: str
    conversation_id: int
    is_demo_mode: bool
    kb_references: List[str] = []
    suggest_ticket: bool = False
    suggested_category: Optional[str] = None
    suggested_subject: Optional[str] = None

class AISummarizeRequest(BaseModel):
    ticket_id: int

class AISummarizeResponse(BaseModel):
    summary: str
    key_points: List[str]
    suggested_priority: str
    sentiment: str
    is_demo_mode: bool

class AISuggestResponse(BaseModel):
    suggestion: str
    confidence: float
    is_demo_mode: bool

# Audit Log schemas
class AuditLogOut(BaseModel):
    id: int
    actor_user_id: Optional[int] = None
    actor_email: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True
