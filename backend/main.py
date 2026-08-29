from database import mock_users
import requests
from fastapi import FastAPI
from pydantic import BaseModel

# Initialise our FastAPI web server
app = FastAPI(title="Chum Buddies")


# Define what incoming chat/translation data should look like
class Message(BaseModel):
    text: str

# 1. MATCHING ALGORITHM (JACCARD SIMILARITY)

def calculate_jaccard(list1, list2):
    """
    Compares two lists (like societies or languages).
    Formula: Shared items divided by Total unique items.
    Returns a score between 0.0 (no overlap) and 1.0 (exact match).
    """
    set1, set2 = set(list1), set(list2)
    shared_items = len(set1.intersection(set2))
    total_unique_items = len(set1.union(set2))
    
    if total_unique_items == 0:
        return 0.0
    return shared_items / total_unique_items


def get_matches(target_user, all_users):
    """
    Takes one student and compares them against everyone else in the database.
    Ranks them from highest compatibility to lowest.
    """
    scored_matches = []

    for user in all_users:
        # Don't match the user with themselves
        if user["id"] == target_user["id"]:
            continue

        # 1. Base Score: Shared society overlap (0.0 to 1.0)
        score = calculate_jaccard(target_user["societies"], user["societies"])

        # 2. Bonus: Same degree (+0.3)
        if target_user["degree"] == user["degree"]:
            score += 0.3

        # 3. Bonus: Same proximity to campus (+0.2)
        if target_user["proximity"] == user["proximity"]:
            score += 0.2

        # 4. Bonus: Matching hangout preference (+0.2)
        if target_user["hangout_pref"] == user["hangout_pref"]:
            score += 0.2

        # Ensure score doesn't exceed 1.0 (100% match)
        final_score = min(score, 1.0)

        # Only include people who have at least some overlap
        if final_score > 0:
            scored_matches.append({
                "user": user,
                "match_score": round(final_score, 2)
            })

    # Sort results so highest match score appears at the top
    return sorted(scored_matches, key=lambda item: item["match_score"], reverse=True)


# 2. API ENDPOINTS (ROUTES FOR THE FRONTEND)

@app.get("/api/users")
async def get_all_users():
    """Returns the full list of students for search and filter screens."""
    return mock_users


@app.get("/api/match/{user_id}")
async def match_user(user_id: str):
    """Finds ranked recommendations for a specific user ID."""
    # Find the target student in our mock database
    target_user = next((u for u in mock_users if u["id"] == user_id), None)
    
    # Return an error message if the ID does not exist
    if not target_user:
        return {"error": "User not found"}

    # Run the matching algorithm and return the results
    matches = get_matches(target_user, mock_users)
    return {
        "target": target_user,
        "matches": matches
    }


@app.post("/api/translate")
async def translate_placeholder(message: Message, src_lang, dest_lang):
    """Placeholder endpoint for the live translation feature."""
    original_text = message.text

    url = "https://translation.googleapis.com/language/translate/v2"

    request_body = {
        "q": original_text,
        "source": src_lang,
        "target": dest_lang,
        "format": "text"
    }

    r = requests.post(url, headers={"X-goog-api-key": API_KEY, "Content-Type": "application/json"}, json=request_body)
    return_data = r.json()
    translated_text = return_data["data"]["translations"][0]["translatedText"]

    return {
        "original": original_text,
        "translated": translated_text
    }