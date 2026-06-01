import base64
import urllib.parse
import httpx


def generate_garden_image(plant_suggestions: str, visual_description: str) -> str | None:
    """
    Generate an image of the exact garden space with recommended plants.
    Uses the visual description extracted from the original photo to match the space.
    """
    prompt = (
        f"Photorealistic photo of {visual_description}, "
        f"now fully planted with {plant_suggestions} growing naturally inside it. "
        "The plants fill the exact same space — same angle, same perspective, same background, same lighting. "
        "Lush green leaves, healthy vegetables and herbs, dark rich soil visible between plants. "
        "No people, no text overlays, highly detailed, natural colors."
    )

    encoded = urllib.parse.quote(prompt)
    url = (
        f"https://image.pollinations.ai/prompt/{encoded}"
        "?width=1024&height=768&nologo=true&enhance=true&model=flux"
    )

    try:
        res = httpx.get(url, timeout=90, follow_redirects=True)
        if res.status_code == 200 and len(res.content) > 1000:
            return base64.b64encode(res.content).decode("utf-8")
        return None
    except Exception:
        return None
