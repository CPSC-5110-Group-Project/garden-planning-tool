from dataclasses import dataclass
from typing import Optional

from sqlalchemy import case, or_, func
from sqlalchemy.orm import Session, Query, load_only
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
    Plant.growth_rate,
    Plant.type,
    Plant.edible_fruit,
    Plant.edible_leaf,
    Plant.flowers,
)

_SUNLIGHT_FILTER_OPTIONS = ("Full sun", "Part shade", "Filtered shade", "Shade")


@dataclass
class PlantFilters:
    type: Optional[str] = None
    watering: Optional[str] = None
    sunlight: Optional[str] = None
    care_level: Optional[str] = None
    growth_rate: Optional[str] = None
    cycle: Optional[str] = None
    edible_fruit: Optional[bool] = None
    edible_leaf: Optional[bool] = None
    flowers: Optional[bool] = None

    def is_active(self) -> bool:
        return any(
            getattr(self, field) is not None
            for field in (
                "type",
                "watering",
                "sunlight",
                "care_level",
                "growth_rate",
                "cycle",
                "edible_fruit",
                "edible_leaf",
                "flowers",
            )
        )

    def to_query_params(self) -> dict[str, str]:
        params: dict[str, str] = {}
        for field in (
            "type",
            "watering",
            "sunlight",
            "care_level",
            "growth_rate",
            "cycle",
            "edible_fruit",
            "edible_leaf",
            "flowers",
        ):
            value = getattr(self, field)
            if value is not None:
                params[field] = str(value).lower() if isinstance(value, bool) else value
        return params


def _apply_filters(query: Query, filters: PlantFilters) -> Query:
    if filters.type:
        query = query.filter(func.lower(Plant.type) == filters.type.lower())
    if filters.watering:
        query = query.filter(func.lower(Plant.watering) == filters.watering.lower())
    if filters.sunlight:
        query = query.filter(Plant.sunlight.ilike(f"%{filters.sunlight}%"))
    if filters.care_level:
        query = query.filter(func.lower(Plant.care_level) == filters.care_level.lower())
    if filters.growth_rate:
        query = query.filter(func.lower(Plant.growth_rate) == filters.growth_rate.lower())
    if filters.cycle:
        normalized_cycle = _normalize_string_filter(filters.cycle)
        query = query.filter(
            func.lower(func.rtrim(Plant.cycle, ".")) == normalized_cycle
        )
    if filters.edible_fruit is not None:
        query = query.filter(Plant.edible_fruit == filters.edible_fruit)
    if filters.edible_leaf is not None:
        query = query.filter(Plant.edible_leaf == filters.edible_leaf)
    if filters.flowers is not None:
        query = query.filter(Plant.flowers == filters.flowers)
    return query


def _normalize_option_key(value: str) -> str:
    return value.strip().lower().rstrip(".")


def _normalize_string_filter(value: str) -> str:
    return _normalize_option_key(value)


def _pick_canonical_value(variants: list[str]) -> str:
    without_trailing_dot = [value for value in variants if not value.rstrip().endswith(".")]
    pool = without_trailing_dot or variants
    titled = [value for value in pool if value[:1].isupper()]
    return sorted(titled or pool)[0]


def _distinct_values(db: Session, column) -> list[str]:
    rows = (
        db.query(column)
        .filter(column.isnot(None), column != "")
        .distinct()
        .all()
    )
    grouped: dict[str, list[str]] = {}
    for (value,) in rows:
        if value:
            grouped.setdefault(_normalize_option_key(value), []).append(value)
    return sorted(
        (_pick_canonical_value(variants) for variants in grouped.values()),
        key=str.lower,
    )


def get_filter_options(db: Session) -> dict[str, list[str]]:
    return {
        "type": _distinct_values(db, Plant.type),
        "watering": _distinct_values(db, Plant.watering),
        "sunlight": list(_SUNLIGHT_FILTER_OPTIONS),
        "care_level": _distinct_values(db, Plant.care_level),
        "growth_rate": _distinct_values(db, Plant.growth_rate),
        "cycle": _distinct_values(db, Plant.cycle),
    }


def get_plants(
    db: Session,
    page: int = 1,
    limit: int = 20,
    filters: PlantFilters | None = None,
):
    offset = (page - 1) * limit
    base = (
        db.query(Plant)
        .options(load_only(*_SUMMARY_COLS))
        .order_by(Plant.perenual_id, Plant.common_name)
    )
    if filters:
        base = _apply_filters(base, filters)
    total = base.count()
    plants = base.offset(offset).limit(limit).all()
    return plants, total


def search_plants(
    db: Session,
    search: str,
    page: int = 1,
    limit: int = 20,
    filters: PlantFilters | None = None,
):
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
    if filters:
        base = _apply_filters(base, filters)

    total = base.count()
    plants = base.offset((page - 1) * limit).limit(limit).all()
    return plants, total


def get_plant(db: Session, perenual_id: int):
    return db.query(Plant).filter(Plant.perenual_id == perenual_id).first()
