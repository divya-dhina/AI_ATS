import os
import json
import profile
import pandas as pd

from modules.ranking.scoring import (
    compute_skill_match,
    compute_experience_score,
    compute_certification_score,
    compute_project_score,
)

from modules.ranking.shortlisting import shortlist_candidates
from modules.llm_evaluation.run_llm import run_llm_analysis
from utils.load_jd import load_job_description
from modules.explainability.shap_explainer import generate_shap_explanations

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SEMANTIC_PATH = os.path.join(BASE_DIR, "..", "outputs", "semantic_ranking.csv")
SKILL_PATH = os.path.join(BASE_DIR, "..", "outputs", "skill_profiles.json")
JD_PATH = os.path.join(BASE_DIR, "..", "data", "job_descriptions", "jd_backend_dev.txt")

OUTPUT_PATH = os.path.join(BASE_DIR, "..", "outputs", "final_ranking.csv")


def extract_jd_skills():
    from modules.skill_intelligence.skill_extractor import extract_skills
    from core.preprocess import preprocess_text

    with open(JD_PATH, "r", encoding="utf-8") as f:
        jd_text = preprocess_text(f.read())

    return extract_skills(jd_text)

def analyze_jd():
    with open(JD_PATH, "r", encoding="utf-8") as f:
        jd_text = f.read().lower()

    if "fresher" in jd_text or "0-1 year" in jd_text:
        return "fresher"

    if "3+" in jd_text or "5+" in jd_text:
        return "experienced"

    return "general"

def get_weights(jd_type):

    if jd_type == "fresher":
        return {
            "semantic": 0.4,
            "skill": 0.3,
            "experience": 0.0,
            "certification": 0.1,
            "project": 0.2
        }

    if jd_type == "experienced":
        return {
            "semantic": 0.4,
            "skill": 0.3,
            "experience": 0.2,
            "certification": 0.1,
            "project": 0.0
        }

    return {
        "semantic": 0.4,
        "skill": 0.3,
        "experience": 0.1,
        "certification": 0.1,
        "project": 0.1
    }

def main():

    semantic_df = pd.read_csv(SEMANTIC_PATH)

    with open(SKILL_PATH, "r", encoding="utf-8") as f:
        skill_profiles = json.load(f)

    jd_skills = extract_jd_skills()
    jd_type = analyze_jd()
    weights = get_weights(jd_type)

    print("JD Skills:", jd_skills)
    print("Detected JD Type:", jd_type )
    print("Using Weights:", weights)

    final_results = []

    for _, row in semantic_df.iterrows():
        resume_name = row["Resume"]
        semantic_score = row["Match_Score (%)"]

        profile = next(
        (p for p in skill_profiles if p["candidate"] == resume_name),
        None,
        )

        if not profile:
            continue

        skill_score = compute_skill_match(profile.get("skills", []), jd_skills)
        exp_score = compute_experience_score(profile.get("experience_years", 0))
        cert_score = compute_certification_score(profile.get("certifications", []))
        project_score = compute_project_score(profile.get("projects", []))

        final_score = (
        semantic_score * weights["semantic"] +
        skill_score * weights["skill"] +
        exp_score * weights["experience"] +
        cert_score * weights["certification"] +
        project_score * weights["project"]
        )

        final_results.append({
        "Resume": resume_name,
        "Semantic_Score": semantic_score,
        "Skill_Score": round(skill_score, 2),
        "Experience_Score": exp_score,
        "Certification_Score": cert_score,
        "Project_Score": project_score,
        "Final_Score": round(final_score, 2),
        })

    df = pd.DataFrame(final_results)
    df = df.sort_values(by="Final_Score", ascending=False)

    shortlisted = shortlist_candidates(df)

    # Generate SHAP explanations
    shap_results = generate_shap_explanations(df)

    with open("outputs/shap_explanations.json", "w") as f:
         json.dump(shap_results, f, indent=4)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)

    print("\n🏆 Final Ranking:\n")
    print(df.to_string(index=False))

    print("\n🎯 Shortlisted Candidates:\n")
    print(shortlisted.to_string(index=False))


    # Load job description dynamically
    job_description = load_job_description()
    # load ranking output
    ranking_df = pd.read_csv("outputs/final_ranking.csv")

    llm_results = run_llm_analysis(
    skill_profiles,
    job_description,
    ranking_df
    )


    with open("outputs/llm_evaluation.json", "w") as f:
        json.dump(llm_results, f, indent=4)

if __name__ == "__main__":
    main()