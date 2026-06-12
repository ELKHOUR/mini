from pydantic import BaseModel
from typing import Optional

class CreateProjectRequest(BaseModel):
    project_name: str
    project_lang: str = "en"

class UpdateProjectRequest(BaseModel):
    project_name: Optional[str] = None
    project_lang: Optional[str] = None