from sqlalchemy import case, or_, func
from sqlalchemy.orm import Session, load_only
from models.plant import Plant

# Shared column projection for list/search — avoids loading heavy fields
_SUMMARY_COLS = (
    Plant.perenual_id,
    Plant.common_name,
    Plant.scientific_name,
    Plant.watering,
    Plant.sunlight,
    Plant.care_level,
    Plant.image_url,
)


def get_plants(db: Session, page: int = 1, limit: int = 20):
    offset = (page - 1) * limit
    base = (
        db.query(Plant)
        .options(load_only(*_SUMMARY_COLS))
        .order_by(Plant.perenual_id, Plant.common_name)
    )
    total = base.count()
    plants = base.offset(offset).limit(limit).all()
    return plants, total



def search_plants(db: Session, search: str, page: int = 1, limit: int = 20):
    """
    Ranked ILIKE search across common_name, scientific_name, and other_name.

    Priority:
      1 - exact match on common_name
      2 - starts with on common_name
      3 - contains on common_name
      4 - match on scientific_name or other_name
    """
    term = search.strip()
    contains = f"%{term}%"

    priority = case(
        (Plant.common_name.ilike(term), 1),
        (Plant.common_name.ilike(f"{term}%"), 2),
        (Plant.common_name.ilike(contains), 3),
        else_=4,
    )

    base = (
        db.query(Plant)
        .options(load_only(*_SUMMARY_COLS))
        .filter(
            or_(
                Plant.common_name.ilike(contains),
                Plant.scientific_name.ilike(contains),
                Plant.other_name.ilike(contains),
            )
        )
        .order_by(priority, Plant.common_name, Plant.perenual_id)
    )

    total = base.count()
    plants = base.offset((page - 1) * limit).limit(limit).all()
    return plants, total


def get_plant(db: Session, perenual_id: int):
    return db.query(Plant).filter(Plant.perenual_id == perenual_id).first()
