from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, Generic, TypeVar

T = TypeVar("T")


class PlantSummary(BaseModel):
    perenual_id: int
    common_name: str
    scientific_name: Optional[str] = None
    cycle: Optional[str] = None
    watering: Optional[str] = None
    sunlight: Optional[str] = None
    care_level: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class PlantResponse(BaseModel):
    perenual_id: Optional[int] = None
    common_name: str
    scientific_name: Optional[str] = None
    other_name: Optional[str] = None
    family: Optional[str] = None
    cycle: Optional[str] = None
    watering: Optional[str] = None
    sunlight: Optional[str] = None
    hardiness: Optional[Any] = None
    hardiness_location: Optional[Any] = None
    dimensions: Optional[Any] = None
    care_level: Optional[str] = None
    indoor: Optional[bool] = None
    edible_fruit: Optional[bool] = None
    edible_leaf: Optional[bool] = None
    cuisine: Optional[bool] = None
    medicinal: Optional[bool] = None
    poisonous_to_humans: Optional[bool] = None
    poisonous_to_pets: Optional[bool] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    last_synced: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaginationLinks(BaseModel):
    first: str
    last: str
    next: Optional[str] = None
    prev: Optional[str] = None
    self: str


class PaginationMeta(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    links: PaginationLinks
    meta: PaginationMeta