import pathlib as pl
from typing import Any, Dict, List

import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Chum Buddies")

# Define expected data structures
class Message(BaseModel):
    text: str

class MatchRequest(BaseModel):
    target_user: Dict[str, Any]
    all_users: List[Dict[str, Any]]

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# 1. MATCHING ALGORITHM (JACCARD SIMILARITY)

def calculate_jaccard(list1, list2):
    """Compares two lists. Returns score 0.0 (no overlap) to 1.0 (exact match)."""
    set1 = set(list1) if list1 else set()
    set2 = set(list2) if list2 else set()
    
    shared_items = len(set1.intersection(set2))
    total_unique_items = len(set1.union(set2))
    
    if total_unique_items == 0:
        return 0.0
    return shared_items / total_unique_items

def get_matches(target_user, all_users):
    """Scores compatibility against actual Firebase user data."""
    scored_matches = []

    for user in all_users:
        if user.get("id") == target_user.get("id"):
            continue

        score = 0.0
        
        # 1. Base Score: Shared interests (40% weight)
        score += calculate_jaccard(target_user.get("interests"), user.get("interests")) * 0.4
        
        # 2. Bonus: Shared societies (30% weight)
        score += calculate_jaccard(target_user.get("societies"), user.get("societies")) * 0.3
        
        # 3. Bonus: Shared languages (10% weight)
        score += calculate_jaccard(target_user.get("languages"), user.get("languages")) * 0.1

        # 4. Bonus: Same Degree (+0.2 flat bonus)
        target_degree = target_user.get("degree", "").lower().strip()
        user_degree = user.get("degree", "").lower().strip()
        if target_degree and user_degree and target_degree == user_degree:
            score += 0.2

        final_score = min(score, 1.0)

        # Append the calculated score back into the user dictionary
        user_data = user.copy()
        user_data["match_score"] = round(final_score, 2)
        scored_matches.append(user_data)

    # Sort results so highest match score appears at the top
    return sorted(scored_matches, key=lambda item: item.get("match_score", 0), reverse=True)


# 2. API ENDPOINTS

@app.post("/api/match")
async def match_users(request: MatchRequest):
    """Takes Firebase users from React and returns a sorted array of matches."""
    matches = get_matches(request.target_user, request.all_users)
    return {"matches": matches}

@app.post("/api/translate")
async def translate_placeholder(message: Message, src_lang: str, dest_lang: str):
    """Placeholder endpoint for the live translation feature."""
    original_text = message.text
    url = "https://translation.googleapis.com/language/translate/v2"
    
    request_body = {
        "q": original_text,
        "source": src_lang,
        "target": dest_lang,
        "format": "text"
    }

    try:
        api_path = pl.Path(__file__).resolve().parent / "api" / "api_key.txt"
        with open(api_path) as f:
            API_KEY = f.readline().strip("\n")

        r = requests.post(url, headers={"X-goog-api-key": API_KEY, "Content-Type": "application/json"}, json=request_body)
        return_data = r.json()
        translated_text = return_data["data"]["translations"][0]["translatedText"]
        return {"original": original_text, "translated": translated_text}
    except Exception as e:
        return {"error": str(e)}