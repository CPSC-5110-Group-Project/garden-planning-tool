from unittest.mock import Mock

from crud import plant as plant_crud
from crud.plant import PlantFilters


def query_chain(total=2, rows=None):
    rows = rows or ["plant-a", "plant-b"]
    query = Mock()
    query.options.return_value = query
    query.order_by.return_value = query
    query.filter.return_value = query
    query.offset.return_value = query
    query.limit.return_value = query
    query.count.return_value = total
    query.all.return_value = rows

    db = Mock()
    db.query.return_value = query
    return db, query, rows


def test_get_plants_returns_paginated_rows_and_total():
    db, query, rows = query_chain(total=7)

    result_rows, total = plant_crud.get_plants(db, page=3, limit=2)

    assert result_rows == rows
    assert total == 7
    query.offset.assert_called_once_with(4)
    query.limit.assert_called_once_with(2)


def test_get_plants_applies_active_filters():
    db, query, rows = query_chain(total=3)
    filters = PlantFilters(
        type="Herb",
        watering="Average",
        sunlight="Full sun",
        care_level="Moderate",
        growth_rate="High",
        cycle="Perennial.",
        edible_fruit=False,
        edible_leaf=True,
        flowers=True,
    )

    result_rows, total = plant_crud.get_plants(db, page=1, limit=10, filters=filters)

    assert result_rows == rows
    assert total == 3
    assert query.filter.call_count == 9


def test_search_plants_strips_query_and_paginates_results():
    db, query, rows = query_chain(total=1, rows=["mint"])

    result_rows, total = plant_crud.search_plants(db, search=" mint ", page=2, limit=5)

    assert result_rows == rows
    assert total == 1
    query.filter.assert_called_once()
    query.offset.assert_called_once_with(5)
    query.limit.assert_called_once_with(5)


def test_search_plants_applies_filters_after_search_filter():
    db, query, rows = query_chain(total=1, rows=["mint"])

    result_rows, total = plant_crud.search_plants(
        db,
        search="mint",
        page=1,
        limit=5,
        filters=PlantFilters(watering="Average"),
    )

    assert result_rows == rows
    assert total == 1
    assert query.filter.call_count == 2


def test_distinct_values_groups_normalized_variants():
    column = Mock()
    column.isnot.return_value = "is-not-null"
    query = Mock()
    query.filter.return_value = query
    query.distinct.return_value = query
    query.all.return_value = [
        ("perennial.",),
        ("Perennial",),
        (" annual ",),
        ("",),
        (None,),
    ]
    db = Mock()
    db.query.return_value = query

    assert plant_crud._distinct_values(db, column) == [" annual ", "Perennial"]
    query.filter.assert_called_once()
    query.distinct.assert_called_once()


def test_get_filter_options_combines_distinct_values_and_sunlight_constants(monkeypatch):
    calls = []

    def fake_distinct_values(_db, column):
        calls.append(column)
        return [f"value-{len(calls)}"]

    monkeypatch.setattr(plant_crud, "_distinct_values", fake_distinct_values)

    options = plant_crud.get_filter_options(db=object())

    assert options == {
        "type": ["value-1"],
        "watering": ["value-2"],
        "sunlight": ["Full sun", "Part shade", "Filtered shade", "Shade"],
        "care_level": ["value-3"],
        "growth_rate": ["value-4"],
        "cycle": ["value-5"],
    }


def test_get_plant_filters_by_perenual_id():
    plant = object()
    query = Mock()
    query.filter.return_value = query
    query.first.return_value = plant
    db = Mock()
    db.query.return_value = query

    assert plant_crud.get_plant(db, 42) is plant
    query.filter.assert_called_once()
