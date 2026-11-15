import random
from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import SubscriptionPlan, Subscription, BillingRecord, User
from app.schemas.schemas import (
    SubscriptionPlanOut, SubscriptionOut, SubscriptionChangeRequest, 
    SubscriptionCancelRequest, BillingRecordOut
)
from app.api.deps import get_current_user, log_audit

router = APIRouter(tags=["Subscriptions"])

@router.get("/plans", response_model=List[SubscriptionPlanOut])
def list_plans(db: Session = Depends(get_db)):
    """List all active subscription tiers available for purchase."""
    plans = db.query(SubscriptionPlan).filter(SubscriptionPlan.is_active == True).order_by(SubscriptionPlan.price).all()
    return [SubscriptionPlanOut.model_validate(p) for p in plans]

@router.get("/subscriptions/me", response_model=SubscriptionOut)
def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve current authenticated user's active subscription."""
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).order_by(Subscription.id.desc()).first()

    if not sub:
        # Auto-create basic subscription if none exists
        basic_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "Basic").first()
        if not basic_plan:
            raise HTTPException(status_code=404, detail="Default subscription plan not found")
        sub = Subscription(
            user_id=current_user.id,
            plan_id=basic_plan.id,
            status="active",
            started_at=datetime.now(timezone.utc),
            renewal_date=datetime.now(timezone.utc) + timedelta(days=30)
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)

    return SubscriptionOut.model_validate(sub)

@router.post("/subscriptions", response_model=SubscriptionOut)
def change_subscription(
    req: SubscriptionChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulated subscription change (Upgrade / Downgrade).
    Validates backend logic, generates a simulated invoice record, and logs audit trail.
    """
    target_plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == req.plan_id,
        SubscriptionPlan.is_active == True
    ).first()
    if not target_plan:
        raise HTTPException(status_code=404, detail="Selected subscription plan was not found or is inactive")

    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    old_plan_name = sub.plan.name if sub and sub.plan else "None"

    if sub:
        sub.plan_id = target_plan.id
        sub.status = "active"
        sub.renewal_date = datetime.now(timezone.utc) + timedelta(days=30)
        sub.updated_at = datetime.now(timezone.utc)
    else:
        sub = Subscription(
            user_id=current_user.id,
            plan_id=target_plan.id,
            status="active",
            started_at=datetime.now(timezone.utc),
            renewal_date=datetime.now(timezone.utc) + timedelta(days=30)
        )
        db.add(sub)
    
    db.commit()
    db.refresh(sub)

    # Generate a simulated billing record for the transaction
    inv_num = f"INV-2026-{random.randint(10000, 99999)}"
    billing_record = BillingRecord(
        user_id=current_user.id,
        subscription_id=sub.id,
        invoice_number=inv_num,
        plan_name=f"{target_plan.name} Plan - Monthly",
        amount=target_plan.price,
        currency="USD",
        status="Paid",
        billing_date=datetime.now(timezone.utc),
        payment_method="Simulated Visa (•••• 4242)"
    )
    db.add(billing_record)
    db.commit()

    log_audit(
        db, current_user, "SUBSCRIPTION_CHANGED", "Subscription", str(sub.id),
        {"from_plan": old_plan_name, "to_plan": target_plan.name, "price": target_plan.price, "invoice": inv_num}
    )

    return SubscriptionOut.model_validate(sub)

@router.post("/subscriptions/me/cancel", response_model=SubscriptionOut)
def cancel_subscription(
    req: SubscriptionCancelRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Simulated cancellation of the customer subscription."""
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found to cancel")
    
    if sub.status == "canceled":
        raise HTTPException(status_code=400, detail="Subscription is already canceled")

    sub.status = "canceled"
    sub.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(sub)

    log_audit(
        db, current_user, "SUBSCRIPTION_CANCELED", "Subscription", str(sub.id),
        {"reason": req.reason, "plan": sub.plan.name if sub.plan else "N/A"}
    )

    return SubscriptionOut.model_validate(sub)

@router.get("/billing", response_model=List[BillingRecordOut])
def get_billing_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all simulated billing records and invoices for the user."""
    records = db.query(BillingRecord).filter(
        BillingRecord.user_id == current_user.id
    ).order_by(BillingRecord.billing_date.desc()).all()
    
    return [BillingRecordOut.model_validate(r) for r in records]
