from pydantic import BaseModel, Field
from datetime import datetime
from typing import Annotated, Optional, Any, Generic, TypeVar
from fastapi import Query

T = TypeVar("T")

# Reusable query param types
PageParam = Annotated[int, Query(ge=1, description="Page number")]
LimitParam = Annotated[int, Query(ge=1, le=100, description="Results per page")]


class PlantSummary(BaseModel):
    perenual_id: int
    common_name: str
    scientific_name: Optional[str] = None
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
    hybrid: Optional[str] = None
    authority: Optional[str] = None
    subspecies: Optional[str] = None
    cultivar: Optional[str] = None
    variety: Optional[str] = None
    species_epithet: Optional[str] = None
    genus: Optional[str] = None
    origin: Optional[str] = None
    type: Optional[str] = None
    dimensions: Optional[Any] = None
    cycle: Optional[str] = None
    attracts: Optional[str] = None
    propagation: Optional[str] = None
    hardiness: Optional[Any] = None
    watering: Optional[str] = None
    watering_general_benchmark: Optional[Any] = None
    sunlight: Optional[str] = None
    pruning_month: Optional[str] = None
    pruning_count: Optional[Any] = None
    seeds: Optional[bool] = None
    maintenance: Optional[str] = None
    soil: Optional[str] = None
    growth_rate: Optional[str] = None
    drought_tolerant: Optional[bool] = None
    salt_tolerant: Optional[bool] = None
    thorny: Optional[bool] = None
    invasive: Optional[bool] = None
    tropical: Optional[bool] = None
    indoor: Optional[bool] = None
    care_level: Optional[str] = None
    pest_susceptibility: Optional[str] = None
    flowers: Optional[bool] = None
    flowering_season: Optional[str] = None
    cones: Optional[bool] = None
    fruits: Optional[bool] = None
    edible_fruit: Optional[bool] = None
    harvest_season: Optional[str] = None
    leaf: Optional[bool] = None
    edible_leaf: Optional[bool] = None
    cuisine: Optional[bool] = None
    medicinal: Optional[bool] = None
    poisonous_to_humans: Optional[bool] = None
    poisonous_to_pets: Optional[bool] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    last_synced: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaginationLinks(BaseModel):
    first: str
    last: str
    next: Optional[str] = None
    prev: Optional[str] = None
    self_: str = Field(alias="self")

    class Config:
        populate_by_name = True


class PaginationMeta(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    links: PaginationLinks
    meta: PaginationMeta
