from math import ceil
from urllib.parse import urlencode
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Path
from sqlalchemy.orm import Session
from db import get_db
from schemas.plant import (
    PlantResponse, PlantSummary, PaginatedResponse,
    PaginationLinks, PaginationMeta, PageParam, LimitParam,
    PlantFilterOptions, FilterStrParam, FilterBoolParam,
)
import crud.plant as crud_plant
from crud.plant import PlantFilters

router = APIRouter()


def _build_url(
    request: Request,
    page: int,
    limit: int,
    q: Optional[str] = None,
    filters: PlantFilters | None = None,
) -> str:
    params: dict = {"page": page, "limit": limit}
    if q is not None:
        params["q"] = q
    if filters:
        params.update(filters.to_query_params())
    base = str(request.base_url).rstrip("/") + request.url.path
    return f"{base}?{urlencode(params)}"


def _build_pagination(
    request: Request,
    page: int,
    limit: int,
    total: int,
    q: Optional[str] = None,
    filters: PlantFilters | None = None,
) -> tuple[PaginationLinks, PaginationMeta]:
    total_pages = ceil(total / limit) if total else 1

    links = PaginationLinks(**{
        "first": _build_url(request, 1, limit, q, filters),
        "last": _build_url(request, total_pages, limit, q, filters),
        "next": _build_url(request, page + 1, limit, q, filters) if page < total_pages else None,
        "prev": _build_url(request, page - 1, limit, q, filters) if page > 1 else None,
        "self": _build_url(request, page, limit, q, filters),
    })

    meta = PaginationMeta(total=total, page=page, limit=limit, total_pages=total_pages)

    return links, meta


def _parse_filters(
    type: FilterStrParam = None,
    watering: FilterStrParam = None,
    sunlight: FilterStrParam = None,
    care_level: FilterStrParam = None,
    growth_rate: FilterStrParam = None,
    cycle: FilterStrParam = None,
    edible_fruit: FilterBoolParam = None,
    edible_leaf: FilterBoolParam = None,
    flowers: FilterBoolParam = None,
) -> PlantFilters:
    return PlantFilters(
        type=type,
        watering=watering,
        sunlight=sunlight,
        care_level=care_level,
        growth_rate=growth_rate,
        cycle=cycle,
        edible_fruit=edible_fruit,
        edible_leaf=edible_leaf,
        flowers=flowers,
    )


@router.get("/filter-options", response_model=PlantFilterOptions)
def list_filter_options(db: Session = Depends(get_db)):
    return crud_plant.get_filter_options(db)


@router.get("/search", response_model=PaginatedResponse[PlantSummary])
def search_plants(
    request: Request,
    q: str = Query(min_length=1, max_length=100, strip_whitespace=True, description="Search term for common_name, scientific_name, or other_name"),
    page: PageParam = 1,
    limit: LimitParam = 20,
    filters: PlantFilters = Depends(_parse_filters),
    db: Session = Depends(get_db),
):
    active_filters = filters if filters.is_active() else None
    plants, total = crud_plant.search_plants(
        db, search=q, page=page, limit=limit, filters=active_filters
    )
    links, meta = _build_pagination(request, page, limit, total, q=q, filters=active_filters)
    return PaginatedResponse(data=plants, links=links, meta=meta)


@router.get("/", response_model=PaginatedResponse[PlantSummary])
def list_plants(
    request: Request,
    page: PageParam = 1,
    limit: LimitParam = 20,
    filters: PlantFilters = Depends(_parse_filters),
    db: Session = Depends(get_db),
):
    active_filters = filters if filters.is_active() else None
    plants, total = crud_plant.get_plants(db, page=page, limit=limit, filters=active_filters)
    links, meta = _build_pagination(request, page, limit, total, filters=active_filters)
    return PaginatedResponse(data=plants, links=links, meta=meta)


@router.get("/{perenual_id}", response_model=PlantResponse)
def get_plant(perenual_id: int = Path(ge=1), db: Session = Depends(get_db)):
    plant = crud_plant.get_plant(db, perenual_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant
