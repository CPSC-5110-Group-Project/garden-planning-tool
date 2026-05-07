from pydantic import BaseModel, Field
from typing import Optional

class Garden(BaseModel):
    name: str
    rows: int = Field(gt=0, description="Number of rows in the grid")
    cols: int = Field(gt=0, description="Number of columns in the grid")
    plants: list[Plant] = Field(default_factory=list)
