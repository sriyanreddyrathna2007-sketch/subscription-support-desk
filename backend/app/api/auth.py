from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, UserRole, Subscription, SubscriptionPlan
from app.schemas.schemas import UserRegister, UserLogin, UserOut, TokenResponse, UserProfileUpdate
from app.api.deps import get_current_user, log_audit

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    # Restrict self-registration role to customer
    role = UserRole.CUSTOMER.value
    if user_in.role in [UserRole.AGENT.value, UserRole.ADMIN.value]:
        # For security, public registration can only create customer accounts
        role = UserRole.CUSTOMER.value

    user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=get_password_hash(user_in.password),
        role=role,
        created_at=datetime.now(timezone.utc)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Assign default Basic plan to new customer
    basic_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "Basic").first()
    if basic_plan:
        sub = Subscription(
            user_id=user.id,
            plan_id=basic_plan.id,
            status="active",
            started_at=datetime.now(timezone.utc),
            renewal_date=datetime.now(timezone.utc).replace(month=(datetime.now(timezone.utc).month % 12) + 1)
        )
        db.add(sub)
        db.commit()

    log_audit(db, user, "USER_REGISTERED", "User", str(user.id), {"email": user.email})

    token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "role": user.role, "name": user.name}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower().strip()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    log_audit(db, user, "USER_LOGIN", "User", str(user.id))

    token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "role": user.role, "name": user.name}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit(db, current_user, "USER_LOGOUT", "User", str(current_user.id))
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.patch("/profile", response_model=UserOut)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_in.name is not None and profile_in.name.strip():
        current_user.name = profile_in.name.strip()
    
    if profile_in.email is not None and profile_in.email.strip():
        new_email = profile_in.email.lower().strip()
        if new_email != current_user.email:
            existing = db.query(User).filter(User.email == new_email).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This email address is already in use"
                )
            current_user.email = new_email

    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(current_user)

    log_audit(db, current_user, "USER_PROFILE_UPDATED", "User", str(current_user.id))
    return UserOut.model_validate(current_user)
