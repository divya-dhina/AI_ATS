import requests
import json
import re

from rich import print
from rich.pretty import pprint

from modules.llm_evaluation.prompts import build_prompt

OLLAMA_URL = "http://localhost:11434/api/generate"




def extract_json(text):
    """
    Extract and clean JSON block from LLM response
    """
    try:
        match = re.search(r"\{.*\}", text, re.DOTALL)

        if not match:
            return None

        json_text = match.group()

        # Remove trailing commas
        json_text = re.sub(r",\s*}", "}", json_text)
        json_text = re.sub(r",\s*]", "]", json_text)

        return json.loads(json_text)

    except Exception as e:
        print("JSON parse error:", e)
        return None

def ensure_complete_output(result):
    """
    Fill missing fields returned by the LLM.
    """

    if not result.get("reasoning"):
        result["reasoning"] = (
            "Candidate evaluated based on skills, experience, semantic similarity, "
            "and overall ranking score."
        )

    if not result.get("recommendation"):
        level = result.get("match_level", "").lower()

        if level == "high":
            result["recommendation"] = "Interview"
        elif level == "medium":
            result["recommendation"] = "Consider"
        else:
            result["recommendation"] = "Reject"

    if not result.get("strengths"):
        result["strengths"] = []

    if not result.get("weaknesses"):
        result["weaknesses"] = []

    return result


def evaluate_candidate(candidate, job_description, semantic_score, final_score):

    prompt = build_prompt(candidate, job_description, semantic_score, final_score)

    payload = {
    "model": "llama3:instruct",
    "prompt": prompt,
    "stream": False,
    "options": {
        "temperature": 0.2
    }
}
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=600)
        #print("\n=== STATUS ===", response.status_code)
        #print("\n=== RAW TEXT ===")
        #print(response.text)
        if response.status_code == 200:

            #result_text = response.json()["response"]
            data = response.json()
        #    print("\n=== DEBUG JSON ===", data)

            result_text = data.get("response") or data.get("message") or str(data)
            parsed_json = extract_json(result_text)

            if parsed_json:
                parsed_json = ensure_complete_output(parsed_json)
                return parsed_json

            # fallback if JSON parsing fails
            return {
                "candidate": candidate["candidate"],
                "match_level": "Unknown",
                "strengths": [],
                "weaknesses": [],
                "reasoning": result_text,
                "recommendation": "Review Manually"
            }

    except Exception as e:
        import traceback
        print("\n=== LLM ERROR ===")
        print(traceback.format_exc())
    return {
        "candidate": candidate["candidate"],
        "match_level": "Error",
        "strengths": ["No strengths identified"],
        "weaknesses": ["No weaknesses identified"],
        "reasoning": "LLM evaluation failed",
        "recommendation": "Review Manually"
    }