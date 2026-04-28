from pydantic import BaseModel
from typing import Optional



class ProcessRequest(BaseModel):
    chunk_size: int = 100
    overlap_size: int = 20
     
