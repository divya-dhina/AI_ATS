import json
import matplotlib.pyplot as plt
from modules.dari.clustering import cluster_candidates
from modules.dari.insights import generate_dari_insights
import numpy as np

plt.style.use("ggplot")  # cleaner style


# 🔹 1. Skill Distribution (Improved)
def plot_skill_distribution(skill_data):
    skills = [s[0] for s in skill_data]
    counts = [s[1] for s in skill_data]

    plt.figure(figsize=(10, 6))

    # Horizontal bar (better readability)
    plt.barh(skills[::-1], counts[::-1])

    plt.title("Top Skills Distribution", fontsize=14, fontweight="bold")
    plt.xlabel("Number of Candidates")
    plt.ylabel("Skills")

    # Add values on bars
    for i, v in enumerate(counts[::-1]):
        plt.text(v + 0.2, i, str(v), va='center')

    plt.tight_layout()
    plt.savefig("outputs/skill_distribution.png", dpi=300)
    plt.close()


# 🔹 2. Experience Distribution (FIXED)
def plot_experience_distribution(profiles):
    exp = [round(p.get("experience_years", 0)) for p in profiles]

    # Count occurrences
    unique, counts = np.unique(exp, return_counts=True)

    plt.figure(figsize=(8, 5))

    plt.bar(unique, counts)

    plt.title("Experience Distribution", fontsize=14, fontweight="bold")
    plt.xlabel("Years of Experience")
    plt.ylabel("Number of Candidates")

    # Add labels
    for i, v in enumerate(counts):
        plt.text(unique[i], v + 0.1, str(v), ha='center')

    plt.xticks(unique)

    plt.tight_layout()
    plt.savefig("outputs/experience_distribution.png", dpi=300)
    plt.close()


# 🔹 3. Cluster Distribution (Improved)
def plot_cluster_distribution(profiles):
    clusters = {}

    for p in profiles:
        cid = p.get("cluster", -1)
        clusters[cid] = clusters.get(cid, 0) + 1

    labels = list(clusters.keys())
    values = list(clusters.values())

    plt.figure(figsize=(8, 5))

    bars = plt.bar(labels, values)

    plt.title("Candidate Clusters", fontsize=14, fontweight="bold")
    plt.xlabel("Cluster ID")
    plt.ylabel("Number of Candidates")

    # Add labels on bars
    for i, v in enumerate(values):
        plt.text(labels[i], v + 0.1, str(v), ha='center')

    plt.xticks(labels)

    plt.tight_layout()
    plt.savefig("outputs/cluster_distribution.png", dpi=300)
    plt.close()

def run_dari(skill_profiles_path, output_path="outputs/dari_insights.json"):

    with open(skill_profiles_path, "r", encoding="utf-8") as f:
        profiles = json.load(f)

    # Step 1: clustering
    profiles = cluster_candidates(profiles)

    # Step 2: insights
    insights = generate_dari_insights(profiles)

    # Step 3: generate graphs
    plot_skill_distribution(
    list(zip(insights["skills_chart"]["labels"], insights["skills_chart"]["values"]))
    )
    plot_experience_distribution(profiles)
    plot_cluster_distribution(profiles)

    # Save JSON
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(insights, f, indent=4)

    print("\n📊 DARI Insights + Graphs Generated!\n")

    return insights