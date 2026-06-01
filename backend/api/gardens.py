from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any
from sqlalchemy.orm import Session
from db import get_db
from core.auth import get_current_user
from models.garden import GardenDB

router = APIRouter()

class PlotData(BaseModel):
    sunExposure: str = "full"
    isPlantable: bool = True
    plantId: int | None = None
    plant: Any | None = None

class GardenIn(BaseModel):
    id: str
    name: str
    x: float
    y: float
    rows: int
    cols: int
    plots: dict[str, Any] = {}

class GardensPayload(BaseModel):
    gardens: list[GardenIn]

@router.get("/")
def load_gardens(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(GardenDB).filter(GardenDB.user_id == user_id).all()
    return [
        {
            "id": r.id, "name": r.name,
            "x": r.x, "y": r.y,
            "rows": r.rows, "cols": r.cols,
            "plots": r.plots or {},
        }
        for r in rows
    ]

@router.post("/")
def save_gardens(
    payload: GardensPayload,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    incoming_ids = {g.id for g in payload.gardens}

    # delete removed gardens
    db.query(GardenDB).filter(
        GardenDB.user_id == user_id,
        GardenDB.id.notin_(incoming_ids),
    ).delete(synchronize_session=False)

    # upsert
    for g in payload.gardens:
        existing = db.query(GardenDB).filter_by(id=g.id, user_id=user_id).first()
        if existing:
            existing.name = g.name
            existing.x = g.x; existing.y = g.y
            existing.rows = g.rows; existing.cols = g.cols
            existing.plots = g.plots
        else:
            db.add(GardenDB(
                id=g.id, user_id=user_id,
                name=g.name, x=g.x, y=g.y,
                rows=g.rows, cols=g.cols, plots=g.plots,
            ))

    db.commit()
    return {"ok": True}
