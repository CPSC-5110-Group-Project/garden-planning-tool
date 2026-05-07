import httpx

def get_weather(lat: float, lon: float) -> dict:
    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&temperature_unit=celsius"
    geo_url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"

    with httpx.Client() as client:
        weather_res = client.get(weather_url)
        geo_res = client.get(geo_url, headers={"User-Agent": "garden-planning-tool"})

    current = weather_res.json()["current"]
    geo = geo_res.json()
    
    city = geo.get("address", {}).get("city") or geo.get("address", {}).get("town") or geo.get("address", {}).get("village", "unknown")
    country = geo.get("address", {}).get("country", "")

    return {
        "city": city,
        "country": country,
        "temperature": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "precipitation": current["precipitation"],
        "wind_speed": current["wind_speed_10m"],
    }
