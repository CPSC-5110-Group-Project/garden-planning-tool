from math import ceil
from sqlalchemy.orm import Session, load_only
from models.plant import Plant


def get_plants(db: Session, page: int = 1, limit: int = 20, _cursor_cache: dict = {}):
    """
    Hybrid pagination: page-based URLs with cursor-based efficiency.
    Uses a cursor map to avoid offset scanning — each page maps to the
    perenual_id of the first row on that page.
    """
    # cursor_map: { page_number: perenual_id of first row on that page }
    # Page 1 always starts from the beginning (no cursor needed)
    cursor = _cursor_cache.get(page)

    query = db.query(Plant).options(
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
    ).order_by(Plant.perenual_id)

    if cursor is not None:
        query = query.filter(Plant.perenual_id >= cursor)

    # Fetch one extra to get the cursor for the next page
    results = query.limit(limit + 1).all()
    plants = results[:limit]
    has_more = len(results) > limit

    # Store the cursor for the next page if we don't have it yet
    if has_more and (page + 1) not in _cursor_cache:
        _cursor_cache[page + 1] = results[limit].perenual_id

    return plants, has_more


def get_plant_count(db: Session) -> int:
    return db.query(Plant.perenual_id).count()


def get_plant(db: Session, perenual_id: int):
    return db.query(Plant).filter(Plant.perenual_id == perenual_id).first()