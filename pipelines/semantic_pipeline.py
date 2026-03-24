import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from modules.semantic_matching.embedder import SBERTEmbedder
from core.preprocess import preprocess_text
from core.file_loader import load_resumes

print("RUNNING MAIN FROM:", __file__)

# ---------------- CONFIG ----------------
MATCH_THRESHOLD = 55.0

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

JD_PATH = os.path.join(
    BASE_DIR, "..", "data", "job_descriptions", "jd_backend_dev.txt"
)

RESUME_DIR = os.path.join(
    BASE_DIR, "..", "data", "resumes"
)
# ----------------------------------------


def load_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def classify_tier(score_percent):
    if score_percent >= 70:
        return "Strong Match"
    elif score_percent >= MATCH_THRESHOLD:
        return "Potential Match"
    else:
        return "Weak Match"


def main():
    embedder = SBERTEmbedder()

    # Load and preprocess JD
    jd_text = preprocess_text(load_text(JD_PATH))
    jd_embedding = embedder.embed(jd_text)

    results = []

    # 🔥 USE CENTRAL LOADER
    resumes = load_resumes(RESUME_DIR)

    for resume_file, raw_text in resumes.items():

        print(f"{resume_file} extracted length: {len(raw_text)}")

        resume_text = preprocess_text(raw_text)
        resume_embedding = embedder.embed(resume_text)

        similarity = cosine_similarity(
            [jd_embedding], [resume_embedding]
        )[0][0]

        score_percent = round(similarity * 100, 2)
        tier = classify_tier(score_percent)
        decision = "Selected" if score_percent >= MATCH_THRESHOLD else "Rejected"

        results.append({
            "Resume": resume_file,
            "Match_Score (%)": score_percent,
            "Tier": tier,
            "Decision": decision
        })

    df = pd.DataFrame(results)
    df = df.sort_values(by="Match_Score (%)", ascending=False)

    print("\nSemantic Matching Results:\n")
    print(df.to_string(index=False))

    output_path = os.path.join(BASE_DIR, "..", "outputs", "semantic_ranking.csv")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)


if __name__ == "__main__":
    main()