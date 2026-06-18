from .minirag_base import SQLAlchemyBase
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey, Text, Float
import uuid
from sqlalchemy.dialects.postgresql import UUID

class QueryLog(SQLAlchemyBase):
    __tablename__ = "query_logs"

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    log_uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    query_text = Column(Text, nullable=False)
    was_answered = Column(Boolean, default=False, nullable=False)
    response_time_ms = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)