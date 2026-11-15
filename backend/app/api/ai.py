from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ChatConversation, ChatMessage, SupportTicket, User
from app.schemas.schemas import (
    ChatMessageIn, ChatResponse, AISummarizeResponse, AISuggestResponse
)
from app.services.ai_service import AIService
from app.api.deps import get_optional_current_user, get_current_user, require_agent

router = APIRouter(prefix="/ai", tags=["AI Support Assistant"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_in: ChatMessageIn,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Primary AI customer support chat endpoint.
    Performs knowledge-base retrieval, adheres to approved policies,
    and returns clearly labeled responses with suggestions and demo indicator.
    """
    conversation = None
    history = []

    # If user is authenticated, maintain/retrieve conversation thread
    if current_user:
        if chat_in.conversation_id:
            conversation = db.query(ChatConversation).filter(
                ChatConversation.id == chat_in.conversation_id,
                ChatConversation.user_id == current_user.id
            ).first()

        if not conversation:
            # Create a new conversation thread
            title_preview = chat_in.message[:50].strip()
            conversation = ChatConversation(
                user_id=current_user.id,
                title=title_preview if title_preview else "Support Conversation",
                created_at=datetime.now(timezone.utc)
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        # Retrieve prior messages for conversational context
        prior_msgs = db.query(ChatMessage).filter(
            ChatMessage.conversation_id == conversation.id
        ).order_by(ChatMessage.created_at.desc()).limit(8).all()
        
        for m in reversed(prior_msgs):
            history.append({"role": m.role, "content": m.content})

        # Save user message
        db_user_msg = ChatMessage(
            conversation_id=conversation.id,
            role="user",
            content=chat_in.message.strip(),
            created_at=datetime.now(timezone.utc)
        )
        db.add(db_user_msg)
        db.commit()

    # Call AI Service
    ai_result = await AIService.chat(
        db=db,
        user_message=chat_in.message,
        user=current_user,
        history=history
    )

    # Save assistant message if conversation exists
    if conversation:
        db_bot_msg = ChatMessage(
            conversation_id=conversation.id,
            role="assistant",
            content=ai_result["reply"],
            is_demo_mode=ai_result.get("is_demo_mode", False),
            created_at=datetime.now(timezone.utc)
        )
        db.add(db_bot_msg)
        conversation.updated_at = datetime.now(timezone.utc)
        db.commit()

    return ChatResponse(
        reply=ai_result["reply"],
        conversation_id=conversation.id if conversation else 0,
        is_demo_mode=ai_result.get("is_demo_mode", True),
        kb_references=ai_result.get("kb_references", []),
        suggest_ticket=ai_result.get("suggest_ticket", False),
        suggested_category=ai_result.get("suggested_category"),
        suggested_subject=ai_result.get("suggested_subject")
    )

@router.get("/conversations")
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve user's previous AI chat sessions."""
    conversations = db.query(ChatConversation).filter(
        ChatConversation.user_id == current_user.id
    ).order_by(ChatConversation.updated_at.desc()).all()

    return [
        {
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "message_count": len(c.messages)
        }
        for c in conversations
    ]

@router.get("/conversations/{conversation_id}/messages")
def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full message history for a specific conversation session."""
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "is_demo_mode": m.is_demo_mode,
            "created_at": m.created_at
        }
        for m in conv.messages
    ]

@router.delete("/conversations/{conversation_id}")
def clear_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a conversation history."""
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conv)
    db.commit()
    return {"message": "Conversation cleared successfully"}

@router.post("/tickets/{ticket_id}/summarize", response_model=AISummarizeResponse)
def summarize_ticket(
    ticket_id: int,
    current_user: User = Depends(require_agent),
    db: Session = Depends(get_db)
):
    """Generate an AI summary of a customer ticket for support agents."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")

    result = AIService.summarize_ticket(ticket)
    return AISummarizeResponse(**result)

@router.post("/tickets/{ticket_id}/suggest-response", response_model=AISuggestResponse)
def suggest_response(
    ticket_id: int,
    current_user: User = Depends(require_agent),
    db: Session = Depends(get_db)
):
    """Generate an AI response draft for a support agent to edit and review before sending."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")

    result = AIService.suggest_response(ticket)
    return AISuggestResponse(**result)
