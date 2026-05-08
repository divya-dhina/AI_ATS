from fastapi import APIRouter
import json

router = APIRouter()

@router.get("/")
def get_insights():
    with open("outputs/dari_insights.json", "r", encoding="utf-8") as f:
        insights = json.load(f)

    return {
        **insights,
        "images": {
            "skills": "/outputs/skill_distribution.png",
            "experience": "/outputs/experience_distribution.png",
            "clusters": "/outputs/cluster_distribution.png"
        }
    }