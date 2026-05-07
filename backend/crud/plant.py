from math import ceil
from sqlalchemy import case, or_
from sqlalchemy.orm import Session, load_only
from models.plant import Plant


# Cursor cache: keyed by (page, limit) for default listing (no search)
_cursor_cache: dict = {}


def _search_query(db: Session, search: str):
    """
    Returns a query filtered and ranked by search term across
    common_name, scientific_name, and other_name.

    Priority:
      1 - exact match on common_name
      2 - starts with on common_name
      3 - contains on common_name
      4 - match on scientific_name or other_name
    """
    term = search.strip()
    exact = term
    starts = f"{term}%"
    contains = f"%{term}%"

    priority = case(
        (Plant.common_name.ilike(exact), 1),
        (Plant.common_name.ilike(starts), 2),
        (Plant.common_name.ilike(contains), 3),
        else_=4,
    )

    return (
        db.query(Plant)
        .options(
            load_only(
                Plant.perenual_id,
                Plant.common_name,
                Plant.scientific_name,
                Plant.cycle,
                Plant.watering,
                Plant.sunlight,
                Plant.care_level,
                Plant.image_url,
            )
        )
        .filter(
            or_(
                Plant.common_name.ilike(contains),
                Plant.scientific_name.ilike(contains),
                Plant.other_name.ilike(contains),
            )
        )
        .order_by(priority, Plant.common_name, Plant.perenual_id)
    )


def search_plants(db: Session, search: str, page: int = 1, limit: int = 20):
    """Search uses offset pagination — cursor not applicable for ranked results."""
    query = _search_query(db, search)
    total = query.count()
    plants = query.offset((page - 1) * limit).limit(limit).all()
    return plants, total


def get_plants(db: Session, page: int = 1, limit: int = 20):
    """
    Default listing uses hybrid cursor pagination for efficiency.
    """
    cursor = _cursor_cache.get((page, limit))

    query = (
        db.query(Plant)
        .options(
            load_only(
                Plant.perenual_id,
                Plant.common_name,
                Plant.scientific_name,
                Plant.cycle,
                Plant.watering,
                Plant.sunlight,
                Plant.care_level,
                Plant.image_url,
            )
        )
        .order_by(Plant.perenual_id)
    )

    if cursor is not None:
        query = query.filter(Plant.perenual_id >= cursor)

    results = query.limit(limit + 1).all()
    plants = results[:limit]
    has_more = len(results) > limit

    if has_more and (page + 1, limit) not in _cursor_cache:
        _cursor_cache[(page + 1, limit)] = results[limit].perenual_id

    return plants, has_more


def get_plant_count(db: Session) -> int:
    return db.query(Plant.perenual_id).count()


def get_plant(db: Session, perenual_id: int):
    return db.query(Plant).filter(Plant.perenual_id == perenual_id).first()