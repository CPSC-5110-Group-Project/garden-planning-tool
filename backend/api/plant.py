from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from db import get_db
from schemas.plant import PlantResponse, PlantSummary, PaginatedResponse, PaginationLinks, PaginationMeta
import crud.plant as crud_plant

router = APIRouter()


def build_page_url(request: Request, page: int, limit: int, q: str | None = None) -> str:
    params = f"?page={page}&limit={limit}"
    if q:
        params += f"&q={q}"
    return f"{request.url.path}{params}"


@router.get("/search", response_model=PaginatedResponse[PlantSummary])
def search_plants(
    request: Request,
    q: str = Query(min_length=1, description="Search term for common_name, scientific_name, or other_name"),
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Results per page"),
    db: Session = Depends(get_db),
):
    plants, total = crud_plant.search_plants(db, search=q, page=page, limit=limit)
    total_pages = ceil(total / limit) if total else 1

    links = PaginationLinks(
        first=build_page_url(request, 1, limit, q),
        last=build_page_url(request, total_pages, limit, q),
        next=build_page_url(request, page + 1, limit, q) if page < total_pages else None,
        prev=build_page_url(request, page - 1, limit, q) if page > 1 else None,
        self=build_page_url(request, page, limit, q),
    )

    meta = PaginationMeta(
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )

    return PaginatedResponse(data=plants, links=links, meta=meta)


@router.get("/", response_model=PaginatedResponse[PlantSummary])
def list_plants(
    request: Request,
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Results per page"),
    db: Session = Depends(get_db),
):
    total = crud_plant.get_plant_count(db)
    total_pages = ceil(total / limit) if total else 1

    plants, has_more = crud_plant.get_plants(db, page=page, limit=limit)

    links = PaginationLinks(
        first=build_page_url(request, 1, limit),
        last=build_page_url(request, total_pages, limit),
        next=build_page_url(request, page + 1, limit) if has_more else None,
        prev=build_page_url(request, page - 1, limit) if page > 1 else None,
        self=build_page_url(request, page, limit),
    )

    meta = PaginationMeta(
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )

    return PaginatedResponse(data=plants, links=links, meta=meta)


@router.get("/{perenual_id}", response_model=PlantResponse)
def get_plant(perenual_id: int, db: Session = Depends(get_db)):
    plant = crud_plant.get_plant(db, perenual_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant