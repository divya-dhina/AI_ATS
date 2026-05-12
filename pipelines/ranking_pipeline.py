import os
import sys
import json
import pandas as pd

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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
from modules.dari.run_dari import run_dari

from database.insert_data import (
    clear_results_tables,
    insert_candidates,
    insert_shap_results,
    insert_skill_profiles,
    insert_semantic_ranking,
    insert_final_ranking,
    insert_llm_results,
    insert_dari_insights
    
)

# -------------------------
# Paths
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEMANTIC_PATH = os.path.join(BASE_DIR, "..", "outputs", "semantic_ranking.csv")
SKILL_PATH = os.path.join(BASE_DIR, "..", "outputs", "skill_profiles.json")
JD_PATH = os.path.join(BASE_DIR, "..", "data", "job_descriptions", "jd.txt")
FINAL_OUTPUT_PATH = os.path.join(BASE_DIR, "..", "outputs", "final_ranking.csv")

# -------------------------
# JD Utilities
# -------------------------
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
        return {"semantic": 0.4, "skill": 0.3, "experience": 0.0, "certification": 0.1, "project": 0.2}
    if jd_type == "experienced":
        return {"semantic": 0.4, "skill": 0.3, "experience": 0.2, "certification": 0.1, "project": 0.0}
    return {"semantic": 0.4, "skill": 0.3, "experience": 0.1, "certification": 0.1, "project": 0.1}

# -------------------------
# Main Pipeline
# -------------------------
def main():
    print("💾 Clearing previous results from final_ranking...")
    clear_results_tables()

    print("📄 Loading semantic ranking...")
    semantic_df = pd.read_csv(SEMANTIC_PATH)

    print("📂 Loading skill profiles...")
    with open(SKILL_PATH, "r", encoding="utf-8") as f:
        skill_profiles = json.load(f)

    print("📝 Extracting JD info...")
    jd_skills = extract_jd_skills()
    jd_type = analyze_jd()
    weights = get_weights(jd_type)
    print("JD Skills:", jd_skills)
    print("Detected JD Type:", jd_type)
    print("Using Weights:", weights)

    # -------------------------
    # Insert candidates to DB and get candidate_id map
    # -------------------------
    candidate_map = insert_candidates(skill_profiles)

    # -------------------------
    # Insert skill profiles & semantic ranking
    # -------------------------
    insert_skill_profiles(skill_profiles, candidate_map)
    insert_semantic_ranking(SEMANTIC_PATH, candidate_map)

    # -------------------------
    # Compute final scores
    # -------------------------
    final_results = []
    for _, row in semantic_df.iterrows():
        resume_name = row["Resume"]
        semantic_score = row["Match_Score (%)"]

        profile = next((p for p in skill_profiles if p["candidate"] == resume_name), None)
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
            "Semantic_Score": round(semantic_score, 2),
            "Skill_Score": round(skill_score, 2),
            "Experience_Score": round(exp_score, 2),
            "Certification_Score": round(cert_score, 2),
            "Project_Score": round(project_score, 2),
            "Final_Score": round(final_score, 2),
        })

    df = pd.DataFrame(final_results)
    df = df.sort_values(by="Final_Score", ascending=False)

    # -------------------------
    # Shortlist top 25%
    # -------------------------
    shortlisted = shortlist_candidates(df, semantic_df)
    df["is_shortlisted"] = df["Resume"].isin(shortlisted["Resume"])

    # -------------------------
    # Save to final_ranking DB table
    # -------------------------
    df_to_insert = pd.DataFrame({
        "candidate_id": [candidate_map[r] for r in df["Resume"]],
        "resume_name": df["Resume"],
        "semantic_score": df["Semantic_Score"],
        "skill_score": df["Skill_Score"],
        "experience_score": df["Experience_Score"],
        "certification_score": df["Certification_Score"],
        "project_score": df["Project_Score"],
        "final_score": df["Final_Score"],
        "is_shortlisted": df["is_shortlisted"]
    })

    print("💾 Saving final ranking to database...")
    insert_final_ranking(df_to_insert)

    # -------------------------
    # SHAP explanations
    # -------------------------

    shap_results = generate_shap_explanations(df)

    # 🔥 ADD THESE 2 LINES
    df["candidate"] = df["Resume"]
    df["candidate_id"] = df["Resume"].map(candidate_map)

    # Save JSON
    with open(os.path.join(BASE_DIR, "..", "outputs", "shap_explanations.json"), "w") as f:
        json.dump(shap_results, f, indent=4)

    insert_shap_results(shap_results, df)
    
    print(df[["Resume", "candidate", "candidate_id"]].head())
    # -------------------------
    # Run LLM evaluation
    # -------------------------
    job_description = load_job_description()
    llm_results = run_llm_analysis(skill_profiles, job_description, df)
    with open(os.path.join(BASE_DIR, "..", "outputs", "llm_evaluation.json"), "w") as f:
        json.dump(llm_results, f, indent=4)
    insert_llm_results(os.path.join(BASE_DIR, "..", "outputs", "llm_evaluation.json"), candidate_map)

    # -------------------------
    # Run DARI insights
    # -------------------------
    run_dari(SKILL_PATH)
    insert_dari_insights(os.path.join(BASE_DIR, "..", "outputs", "dari_insights.json"))

    # -------------------------
    # Save final CSV for reference
    # -------------------------
    df.to_csv(FINAL_OUTPUT_PATH, index=False)
    print("✅ Pipeline Completed Successfully!")


if __name__ == "__main__":
    main()