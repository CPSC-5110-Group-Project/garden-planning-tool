from math import ceil
from urllib.parse import urlencode
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Path
from sqlalchemy.orm import Session
from db import get_db
from schemas.plant import (
    PlantResponse, PlantSummary, PaginatedResponse,
    PaginationLinks, PaginationMeta, PageParam, LimitParam,
)
import crud.plant as crud_plant

router = APIRouter()


def _build_url(request: Request, page: int, limit: int, q: Optional[str] = None) -> str:
    params: dict = {"page": page, "limit": limit}
    if q is not None:
        params["q"] = q
    base = str(request.base_url).rstrip("/") + request.url.path
    return f"{base}?{urlencode(params)}"


def _build_pagination(
    request: Request,
    page: int,
    limit: int,
    total: int,
    q: Optional[str] = None,
) -> tuple[PaginationLinks, PaginationMeta]:
    total_pages = ceil(total / limit) if total else 1

    links = PaginationLinks(**{
        "first": _build_url(request, 1, limit, q),
        "last": _build_url(request, total_pages, limit, q),
        "next": _build_url(request, page + 1, limit, q) if page < total_pages else None,
        "prev": _build_url(request, page - 1, limit, q) if page > 1 else None,
        "self": _build_url(request, page, limit, q),
    })

    meta = PaginationMeta(total=total, page=page, limit=limit, total_pages=total_pages)

    return links, meta


@router.get("/search", response_model=PaginatedResponse[PlantSummary])
def search_plants(
    request: Request,
    q: str = Query(min_length=1, max_length=100, strip_whitespace=True, description="Search term for common_name, scientific_name, or other_name"),
    page: PageParam = 1,
    limit: LimitParam = 20,
    db: Session = Depends(get_db),
):
    plants, total = crud_plant.search_plants(db, search=q, page=page, limit=limit)
    links, meta = _build_pagination(request, page, limit, total, q=q)
    return PaginatedResponse(data=plants, links=links, meta=meta)


@router.get("/", response_model=PaginatedResponse[PlantSummary])
def list_plants(
    request: Request,
    page: PageParam = 1,
    limit: LimitParam = 20,
    db: Session = Depends(get_db),
):
    plants, total = crud_plant.get_plants(db, page=page, limit=limit)
    links, meta = _build_pagination(request, page, limit, total)
    return PaginatedResponse(data=plants, links=links, meta=meta)


@router.get("/{perenual_id}", response_model=PlantResponse)
def get_plant(perenual_id: int = Path(ge=1), db: Session = Depends(get_db)):
    plant = crud_plant.get_plant(db, perenual_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant
