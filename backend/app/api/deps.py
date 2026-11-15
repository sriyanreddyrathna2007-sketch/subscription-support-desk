from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_access_token
from app.models.models import User, UserRole, AuditLog

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def get_optional_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        return None
    try:
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        return user
    except Exception:
        return None

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of the following roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

require_customer = require_role([UserRole.CUSTOMER.value, UserRole.AGENT.value, UserRole.ADMIN.value])
require_agent = require_role([UserRole.AGENT.value, UserRole.ADMIN.value])
require_admin = require_role([UserRole.ADMIN.value])

def log_audit(db: Session, actor: Optional[User], action: str, resource_type: str, resource_id: Optional[str] = None, details: Optional[dict] = None):
    try:
        log = AuditLog(
            actor_user_id=actor.id if actor else None,
            actor_email=actor.email if actor else "anonymous/system",
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            details=details or {}
        )
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Failed to write audit log: {e}")
