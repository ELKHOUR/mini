"""add project_name

Revision ID: add_project_name_001
Revises: d201e576553e
Create Date: 2026-06-11
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'add_project_name_001'
down_revision: Union[str, Sequence[str], None] = 'd201e576553e'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('projects', sa.Column('project_name', sa.String(), nullable=True))

def downgrade() -> None:
    op.drop_column('projects', 'project_name')

