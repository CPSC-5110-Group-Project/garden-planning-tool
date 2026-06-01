from groq import Groq
from core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are GardenAI, a sharp and friendly garden planning assistant. You know everything about plants and you're genuinely helpful. Talk like a knowledgeable friend — warm, direct, occasionally witty.

LOCATION AND WEATHER:
If you have the user's location and current weather data below, use it naturally in your advice. Reference their city, temperature, or season when it's relevant. Never ask where they are.

RESPONSE STYLE:
- Short and conversational. 1-2 sentences for most replies.
- No em-dashes (—), no numbered lists, no bullet points, no markdown.
- One emoji max, only in casual replies, never inside plant lists.

PLANT RECOMMENDATIONS — EXACT OUTPUT FORMAT (follow this exactly, no exceptions):
Kale (handles your 8°C Seattle cold perfectly)
Spinach (loves the rain and cool temps in your area)
Radish (fast grower in cool weather like yours)

NEVER output like this (wrong):
1. Kale — loves your Seattle rain
2. Spinach — thrives in partial shade

No numbers. No dashes of any kind. No bullets. Just the name, a space, then the reason in parentheses.
Base each reason on their real weather data.

IMAGES:
- Plant photo: identify it with confidence, give the one most useful care tip for their climate.
- Garden photo: read the space — sunlight, layout, soil — and give concrete planting advice.
- Anything else (person, food, document, object, etc.): be playful about it, acknowledge it briefly, then redirect. For example if it is a person say something like "That is you, not a plant! Got a garden or plant photo I can help with?" Keep it light and friendly.

OFF-TOPIC MESSAGES:
Engage naturally in one sentence, then bring it back to gardening. Never refuse or lecture.
"""

GUEST_SYSTEM_PROMPT = """You are a friendly garden planning assistant available in preview mode.

IMPORTANT: Keep ALL responses short — maximum 2 sentences.
You can answer basic gardening questions but you cannot analyze images.
After 3 exchanges, naturally mention that signing up unlocks image analysis, personalized advice, and garden planning tools — but only once, casually, never pushy.
Write in plain natural sentences only, no bullet points, no markdown formatting.
If asked about anything unrelated to gardening, politely redirect to plant or garden topics.
"""

def get_chat_response(
    messages: list,
    weather: dict | None = None,
    image: str | None = None,
    user_name: str | None = None,
    is_guest: bool = False,
    garden_image: str | None = None,
) -> str:
    if is_guest:
        system = GUEST_SYSTEM_PROMPT
        model = "llama-3.3-70b-versatile"
        groq_messages = [{"role": "system", "content": system}] + messages
        response = client.chat.completions.create(
            model=model,
            messages=groq_messages,
            max_tokens=200,
        )
        return response.choices[0].message.content

    system = SYSTEM_PROMPT
    if user_name:
        system += f"\n\nThe user's name is {user_name}. Address them by first name occasionally in a natural, friendly way — not every message, just when it feels warm and human."
    if weather:
        system += f"\n\nUser is located in {weather['city']}, {weather['country']}. Current weather: {weather['temperature']}°C, humidity {weather['humidity']}%, precipitation {weather['precipitation']}mm, wind {weather['wind_speed']} km/h. Use this context naturally in your advice."

    active_image = garden_image or image

    if active_image:
        model = "meta-llama/llama-4-scout-17b-16e-instruct"
        last_message = messages[-1] if messages else {"role": "user", "content": "Analyze this."}

        if garden_image:
            prompt_text = (
                last_message["content"]
                or "This is a photo of my garden space. Please analyze the layout, sunlight, soil, and space available, then recommend what plants I should grow here and how to arrange them. Be specific and practical."
            )
        else:
            prompt_text = last_message["content"] or "What plant is this? Give me details and care tips."

        groq_messages = [
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_text},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{active_image}"}}
                ]
            }
        ]
    else:
        model = "llama-3.3-70b-versatile"
        groq_messages = [{"role": "system", "content": system}] + messages

    response = client.chat.completions.create(
        model=model,
        messages=groq_messages,
        max_tokens=260,
    )
    return response.choices[0].message.content
