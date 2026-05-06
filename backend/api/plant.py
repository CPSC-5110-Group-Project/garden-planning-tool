from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from schemas.plant import PlantResponse, PlantSummary
import crud.plant as crud_plant

router = APIRouter()


@router.get("/", response_model=list[PlantSummary])
def list_plants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_plant.get_plants(db, skip=skip, limit=limit)


@router.get("/{perenual_id}", response_model=PlantResponse)
def get_plant(perenual_id: int, db: Session = Depends(get_db)):
    plant = crud_plant.get_plant(db, perenual_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant
