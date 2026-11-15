from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.models import KnowledgeBaseArticle, User, UserRole
from app.schemas.schemas import KBArticleCreate, KBArticleUpdate, KBArticleOut
from app.api.deps import get_current_user, require_admin, log_audit

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])

def format_kb_out(art: KnowledgeBaseArticle) -> KBArticleOut:
    return KBArticleOut(
        id=art.id,
        title=art.title,
        content=art.content,
        category=art.category,
        status=art.status,
        created_by=art.created_by,
        author_name=art.author.name if art.author else "Support Team",
        created_at=art.created_at,
        updated_at=art.updated_at
    )

@router.get("", response_model=List[KBArticleOut])
def list_articles(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query("published"),
    db: Session = Depends(get_db)
):
    """List approved knowledge base articles with optional category and search filters."""
    query = db.query(KnowledgeBaseArticle)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(KnowledgeBaseArticle.status == status_filter)

    if category and category.lower() != "all":
        query = query.filter(KnowledgeBaseArticle.category.ilike(category))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                KnowledgeBaseArticle.title.ilike(term),
                KnowledgeBaseArticle.content.ilike(term),
                KnowledgeBaseArticle.category.ilike(term)
            )
        )

    articles = query.order_by(KnowledgeBaseArticle.category, KnowledgeBaseArticle.title).all()
    return [format_kb_out(a) for a in articles]

@router.get("/{article_id}", response_model=KBArticleOut)
def get_article(article_id: int, db: Session = Depends(get_db)):
    """Retrieve full content of a specific knowledge base article."""
    art = db.query(KnowledgeBaseArticle).filter(KnowledgeBaseArticle.id == article_id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Knowledge base article not found")
    return format_kb_out(art)

@router.post("", response_model=KBArticleOut, status_code=status.HTTP_201_CREATED)
def create_article(
    art_in: KBArticleCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin creates a new approved knowledge base article."""
    art = KnowledgeBaseArticle(
        title=art_in.title.strip(),
        content=art_in.content.strip(),
        category=art_in.category.strip(),
        status=art_in.status,
        created_by=current_user.id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(art)
    db.commit()
    db.refresh(art)

    log_audit(db, current_user, "KB_ARTICLE_CREATED", "KnowledgeBaseArticle", str(art.id), {"title": art.title})
    return format_kb_out(art)

@router.patch("/{article_id}", response_model=KBArticleOut)
def update_article(
    article_id: int,
    art_update: KBArticleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin updates an existing knowledge base article."""
    art = db.query(KnowledgeBaseArticle).filter(KnowledgeBaseArticle.id == article_id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Knowledge base article not found")

    if art_update.title is not None and art_update.title.strip():
        art.title = art_update.title.strip()
    if art_update.content is not None and art_update.content.strip():
        art.content = art_update.content.strip()
    if art_update.category is not None and art_update.category.strip():
        art.category = art_update.category.strip()
    if art_update.status is not None:
        art.status = art_update.status

    art.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(art)

    log_audit(db, current_user, "KB_ARTICLE_UPDATED", "KnowledgeBaseArticle", str(art.id), {"title": art.title})
    return format_kb_out(art)

@router.delete("/{article_id}")
def delete_article(
    article_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin archives/deletes a knowledge base article."""
    art = db.query(KnowledgeBaseArticle).filter(KnowledgeBaseArticle.id == article_id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Knowledge base article not found")

    title = art.title
    db.delete(art)
    db.commit()

    log_audit(db, current_user, "KB_ARTICLE_DELETED", "KnowledgeBaseArticle", str(article_id), {"title": title})
    return {"message": "Knowledge base article removed successfully"}
