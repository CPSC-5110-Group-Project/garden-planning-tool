from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any


class PlantSummary(BaseModel):
    id: int
    common_name: str
    scientific_name: Optional[str] = None
    cycle: Optional[str] = None
    watering: Optional[str] = None
    sunlight: Optional[str] = None
    care_level: Optional[str] = None
    default_image: Optional[Any] = None

    class Config:
        from_attributes = True


class PlantResponse(BaseModel):
    id: int
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
    default_image: Optional[Any] = None
    image_url: Optional[str] = None
    created_at: datetime
    last_synced: Optional[datetime] = None

    class Config:
        from_attributes = True
