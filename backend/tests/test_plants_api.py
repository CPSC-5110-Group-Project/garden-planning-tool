from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api import plant as plant_api
from crud.plant import PlantFilters


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(plant_api.router, prefix="/plants")

    def override_db():
        yield object()

    app.dependency_overrides[plant_api.get_db] = override_db
    return TestClient(app)


def plant_stub(perenual_id=1, common_name="Tomato", scientific_name="Solanum lycopersicum"):
    return SimpleNamespace(
        perenual_id=perenual_id,
        common_name=common_name,
        scientific_name=scientific_name,
        watering="Average",
        sunlight="Full sun",
        care_level="Moderate",
        image_url="https://example.com/tomato.webp",
    )


def test_list_plants_returns_pagination_metadata_and_links(client, monkeypatch):
    monkeypatch.setattr(
        plant_api.crud_plant,
        "get_plants",
        lambda _db, page, limit, filters=None: ([plant_stub()], 25),
    )

    response = client.get("/plants/?page=2&limit=10")

    assert response.status_code == 200
    body = response.json()
    assert body["data"][0]["common_name"] == "Tomato"
    assert body["meta"] == {"total": 25, "page": 2, "limit": 10, "total_pages": 3}
    assert body["links"]["first"].endswith("/plants/?page=1&limit=10")
    assert body["links"]["prev"].endswith("/plants/?page=1&limit=10")
    assert body["links"]["next"].endswith("/plants/?page=3&limit=10")
    assert body["links"]["last"].endswith("/plants/?page=3&limit=10")


def test_list_plants_passes_filters_and_preserves_them_in_links(client, monkeypatch):
    captured = {}

    def fake_get_plants(_db, page, limit, filters=None):
        captured["page"] = page
        captured["limit"] = limit
        captured["filters"] = filters
        return [plant_stub()], 1

    monkeypatch.setattr(plant_api.crud_plant, "get_plants", fake_get_plants)

    response = client.get(
        "/plants/?page=1&limit=10&type=herb&edible_fruit=false&flowers=true"
    )

    assert response.status_code == 200
    body = response.json()
    assert captured["page"] == 1
    assert captured["limit"] == 10
    assert captured["filters"] == PlantFilters(
        type="herb",
        edible_fruit=False,
        flowers=True,
    )
    assert "type=herb" in body["links"]["self"]
    assert "edible_fruit=false" in body["links"]["self"]
    assert "flowers=true" in body["links"]["self"]


def test_search_plants_returns_query_aware_links(client, monkeypatch):
    monkeypatch.setattr(
        plant_api.crud_plant,
        "search_plants",
        lambda _db, search, page, limit, filters=None: (
            [plant_stub(2, "Rosemary", "Salvia rosmarinus")],
            1,
        ),
    )

    response = client.get("/plants/search?q=rose mary&page=1&limit=20")

    assert response.status_code == 200
    body = response.json()
    assert body["data"][0]["common_name"] == "Rosemary"
    assert body["meta"] == {"total": 1, "page": 1, "limit": 20, "total_pages": 1}
    assert "q=rose+mary" in body["links"]["self"]
    assert body["links"]["next"] is None
    assert body["links"]["prev"] is None


def test_search_plants_passes_filters_and_preserves_them_in_links(client, monkeypatch):
    captured = {}

    def fake_search_plants(_db, search, page, limit, filters=None):
        captured["search"] = search
        captured["filters"] = filters
        return [plant_stub(2, "Rosemary", "Salvia rosmarinus")], 1

    monkeypatch.setattr(plant_api.crud_plant, "search_plants", fake_search_plants)

    response = client.get(
        "/plants/search?q=rose&page=1&limit=20&watering=average&cycle=perennial"
    )

    assert response.status_code == 200
    body = response.json()
    assert captured["search"] == "rose"
    assert captured["filters"] == PlantFilters(watering="average", cycle="perennial")
    assert "q=rose" in body["links"]["self"]
    assert "watering=average" in body["links"]["self"]
    assert "cycle=perennial" in body["links"]["self"]


def test_list_filter_options_returns_crud_values(client, monkeypatch):
    options = {
        "type": ["Herb"],
        "watering": ["Average"],
        "sunlight": ["Full sun"],
        "care_level": ["Moderate"],
        "growth_rate": ["High"],
        "cycle": ["Perennial"],
    }
    monkeypatch.setattr(plant_api.crud_plant, "get_filter_options", lambda _db: options)

    response = client.get("/plants/filter-options")

    assert response.status_code == 200
    assert response.json() == options


def test_get_plant_returns_detail(client, monkeypatch):
    monkeypatch.setattr(
        plant_api.crud_plant,
        "get_plant",
        lambda _db, perenual_id: plant_stub(perenual_id, "Basil", "Ocimum basilicum"),
    )

    response = client.get("/plants/44")

    assert response.status_code == 200
    assert response.json()["common_name"] == "Basil"
    assert response.json()["perenual_id"] == 44


def test_get_plant_returns_404_for_missing_plant(client, monkeypatch):
    monkeypatch.setattr(plant_api.crud_plant, "get_plant", lambda _db, perenual_id: None)

    response = client.get("/plants/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Plant not found"}


def test_get_ai_description_returns_model_text(monkeypatch):
    plant = plant_stub(44, "Basil", "Ocimum basilicum")
    captured = {}

    class FakeGroq:
        def __init__(self, api_key):
            captured["api_key"] = api_key
            self.chat = SimpleNamespace(
                completions=SimpleNamespace(create=self.create_completion)
            )

        def create_completion(self, model, messages):
            captured["model"] = model
            captured["messages"] = messages
            return SimpleNamespace(
                choices=[
                    SimpleNamespace(
                        message=SimpleNamespace(content="Basil likes warmth and sun.")
                    )
                ]
            )

    monkeypatch.setattr(plant_api.crud_plant, "get_plant", lambda _db, perenual_id: plant)
    monkeypatch.setattr(plant_api, "Groq", FakeGroq)

    response = plant_api.get_ai_description(44, db=object())

    assert response == {"description": "Basil likes warmth and sun."}
    assert captured["api_key"] == plant_api.settings.GROQ_API_KEY
    assert captured["model"] == "llama-3.3-70b-versatile"
    assert "Basil (Ocimum basilicum)" in captured["messages"][0]["content"]


def test_get_ai_description_returns_404_for_missing_plant(monkeypatch):
    monkeypatch.setattr(plant_api.crud_plant, "get_plant", lambda _db, perenual_id: None)

    with pytest.raises(plant_api.HTTPException) as exc_info:
        plant_api.get_ai_description(999, db=object())

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Plant not found"


def test_invalid_query_params_return_422(client):
    invalid_paths = [
        "/plants/?page=0&limit=20",
        "/plants/?page=1&limit=101",
        "/plants/search?q=&page=1&limit=20",
    ]

    for path in invalid_paths:
        response = client.get(path)
        assert response.status_code == 422
