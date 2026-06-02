from api import chat as chat_api


def test_chat_returns_model_response(monkeypatch):
    monkeypatch.setattr(chat_api, "get_chat_response", lambda messages, weather, image: "Plant the basil nearby.")

    response = chat_api.chat(
        chat_api.ChatRequest(
            messages=[chat_api.Message(role="user", content="Where should basil go?")],
        )
    )

    assert response == {"response": "Plant the basil nearby."}


def test_chat_includes_weather_when_coordinates_are_present(monkeypatch):
    captured = {}

    def fake_weather(lat, lon):
        return {"temperature": 72, "lat": lat, "lon": lon}

    def fake_chat_response(messages, weather, image):
        captured["messages"] = messages
        captured["weather"] = weather
        captured["image"] = image
        return "Use a sunny spot."

    monkeypatch.setattr(chat_api, "get_weather", fake_weather)
    monkeypatch.setattr(chat_api, "get_chat_response", fake_chat_response)

    response = chat_api.chat(
        chat_api.ChatRequest(
            messages=[chat_api.Message(role="user", content="Analyze this bed.")],
            lat=47.6,
            lon=-122.3,
            image="base64-image",
        )
    )

    assert response == {"response": "Use a sunny spot."}
    assert captured["messages"] == [{"role": "user", "content": "Analyze this bed."}]
    assert captured["weather"] == {"temperature": 72, "lat": 47.6, "lon": -122.3}
    assert captured["image"] == "base64-image"


def test_chat_continues_when_weather_lookup_fails(monkeypatch):
    captured = {}

    def failing_weather(_lat, _lon):
        raise RuntimeError("weather unavailable")

    def fake_chat_response(_messages, weather, _image):
        captured["weather"] = weather
        return "Fallback advice."

    monkeypatch.setattr(chat_api, "get_weather", failing_weather)
    monkeypatch.setattr(chat_api, "get_chat_response", fake_chat_response)

    response = chat_api.chat(
        chat_api.ChatRequest(
            messages=[chat_api.Message(role="user", content="Help.")],
            lat=47.6,
            lon=-122.3,
        )
    )

    assert response == {"response": "Fallback advice."}
    assert captured["weather"] is None
