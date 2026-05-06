from sqlalchemy.orm import Session, load_only
from models.plant import Plant


def get_plants(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Plant).options(
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
    ).order_by(Plant.perenual_id).offset(skip).limit(limit).all()


def get_plant(db: Session, perenual_id: int):
    return db.query(Plant).filter(Plant.perenual_id == perenual_id).first()
