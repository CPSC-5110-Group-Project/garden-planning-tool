from fastapi import APIRouter
from pydantic import BaseModel
from services.chat import get_chat_response
from services.image_gen import generate_garden_image

router = APIRouter()


class ConvMessage(BaseModel):
    role: str
    content: str


class VisualizeRequest(BaseModel):
    garden_image: str
    user_name: str | None = None
    conversation: list[ConvMessage] = []


def _extract_plants_from_conversation(conversation: list[ConvMessage]) -> str | None:
    """Look through recent assistant messages for plant suggestions."""
    plant_keywords = ["tomato", "lettuce", "basil", "carrot", "spinach", "rose", "peony",
                      "herb", "pepper", "cucumber", "radish", "bean", "pea", "thyme",
                      "rosemary", "lavender", "mint", "kale", "zucchini", "sunflower"]
    for msg in reversed(conversation):
        if msg.role == "assistant":
            text = msg.content.lower()
            found = [kw for kw in plant_keywords if kw in text]
            if len(found) >= 1:
                # Build a clean list from what the AI mentioned
                return ", ".join(found[:6])
    return None


@router.post("/visualize-garden")
def visualize_garden(request: VisualizeRequest):
    # Step 1 — try to use plants already suggested in conversation
    plant_list = _extract_plants_from_conversation(request.conversation)

    # Step 2 — if none found, ask AI specifically based on the image
    if not plant_list:
        raw = get_chat_response(
            messages=[{"role": "user", "content": (
                "List exactly 5 plants best suited for this garden space. "
                "Reply with ONLY the plant names separated by commas. "
                "Example: tomatoes, basil, lettuce, carrots, spinach"
            )}],
            image=request.garden_image,
            is_guest=False,
        )
        # Clean up the response
        cleaned = raw.strip().replace("\n", " ").strip(".")
        if cleaned and len(cleaned) < 150:
            plant_list = cleaned
        else:
            plant_list = "tomatoes, basil, lettuce, carrots, spinach"

    # Step 3 — get visual description of the exact space
    visual_details = get_chat_response(
        messages=[{"role": "user", "content": (
            "Describe this garden in 1 sentence for image generation: "
            "include the garden type, material, approximate size, angle, and background. "
            "Under 40 words."
        )}],
        image=request.garden_image,
        is_guest=False,
    )

    # Step 4 — generate the image
    image_b64 = generate_garden_image(plant_list, visual_details)

    # Step 5 — format clean output
    plants = [p.strip().capitalize() for p in plant_list.split(",") if p.strip()]
    numbered = "\n".join([f"{i+1}. {p}" for i, p in enumerate(plants)])

    analysis = f"Plants for your space:\n{numbered}"

    return {
        "analysis": analysis,
        "plants": plant_list,
        "visualization": image_b64,
    }
