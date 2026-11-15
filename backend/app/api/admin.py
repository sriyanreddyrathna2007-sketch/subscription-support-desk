from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.models import User, UserRole, SubscriptionPlan, AuditLog
from app.schemas.schemas import (
    UserOut, UserRoleUpdate, SubscriptionPlanCreate, SubscriptionPlanUpdate, 
    SubscriptionPlanOut, AuditLogOut
)
from app.api.deps import require_admin, log_audit

router = APIRouter(prefix="/admin", tags=["Administrator Management"])

@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin retrieves user list with role filtering and search."""
    query = db.query(User)

    if role and role.lower() != "all":
        query = query.filter(User.role == role)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(or_(User.name.ilike(term), User.email.ilike(term)))

    users = query.order_by(User.created_at.desc()).all()
    return [UserOut.model_validate(u) for u in users]

@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    role_in: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin updates role of any user account."""
    if role_in.role not in [UserRole.CUSTOMER.value, UserRole.AGENT.value, UserRole.ADMIN.value]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent admin from demoting themselves accidentally
    if target_user.id == current_user.id and role_in.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=400, detail="You cannot revoke your own administrator privileges")

    old_role = target_user.role
    target_user.role = role_in.role
    target_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(target_user)

    log_audit(
        db, current_user, "USER_ROLE_CHANGED", "User", str(target_user.id),
        {"target_email": target_user.email, "from_role": old_role, "to_role": target_user.role}
    )

    return UserOut.model_validate(target_user)

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    action: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin retrieves security audit log records."""
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [AuditLogOut.model_validate(l) for l in logs]

@router.post("/plans", response_model=SubscriptionPlanOut, status_code=status.HTTP_201_CREATED)
def create_plan(
    plan_in: SubscriptionPlanCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin creates a new subscription tier."""
    plan = SubscriptionPlan(
        name=plan_in.name.strip(),
        description=plan_in.description.strip(),
        price=plan_in.price,
        billing_interval=plan_in.billing_interval,
        features=plan_in.features,
        is_active=plan_in.is_active
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    log_audit(db, current_user, "PLAN_CREATED", "SubscriptionPlan", str(plan.id), {"plan_name": plan.name})
    return SubscriptionPlanOut.model_validate(plan)

@router.patch("/plans/{plan_id}", response_model=SubscriptionPlanOut)
def update_plan(
    plan_id: int,
    plan_in: SubscriptionPlanUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin updates subscription plan details or active state."""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")

    if plan_in.name is not None:
        plan.name = plan_in.name.strip()
    if plan_in.description is not None:
        plan.description = plan_in.description.strip()
    if plan_in.price is not None:
        plan.price = plan_in.price
    if plan_in.billing_interval is not None:
        plan.billing_interval = plan_in.billing_interval
    if plan_in.features is not None:
        plan.features = plan_in.features
    if plan_in.is_active is not None:
        plan.is_active = plan_in.is_active

    db.commit()
    db.refresh(plan)

    log_audit(db, current_user, "PLAN_UPDATED", "SubscriptionPlan", str(plan.id), {"plan_name": plan.name})
    return SubscriptionPlanOut.model_validate(plan)
