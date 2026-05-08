from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans


model = SentenceTransformer("all-MiniLM-L6-v2")


def build_candidate_text(profile):
    return " ".join(profile.get("skills", []))

def cluster_candidates(profiles, k=3):

    if not profiles:
        return profiles

    n_samples = len(profiles)

    # 🔥 FIX: Adjust clusters dynamically
    k = min(k, n_samples)

    # Edge case: only 1 candidate
    if k <= 1:
        for p in profiles:
            p["cluster"] = 0
        return profiles

    texts = [build_candidate_text(p) for p in profiles]
    embeddings = model.encode(texts)

    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(embeddings)

    for i, profile in enumerate(profiles):
        profile["cluster"] = int(labels[i])

    return profiles
