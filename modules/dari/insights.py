from collections import Counter
import numpy as np


def generate_skill_insights(profiles):

    all_skills = []
    for p in profiles:
        all_skills.extend(p.get("skills", []))

    counter = Counter(all_skills)

    return {
        "top_skills": counter.most_common(10)
    }


def experience_distribution(profiles):

    exp_values = [p.get("experience_years", 0) for p in profiles]

    return {
        "average_experience": round(np.mean(exp_values), 2),
        "max_experience": max(exp_values),
        "min_experience": min(exp_values)
    }


def cluster_summary(profiles):

    clusters = {}

    for p in profiles:
        cid = p.get("cluster", -1)
        clusters.setdefault(cid, []).append(p["candidate"])

    return clusters


def generate_dari_insights(profiles):

    skill_data = generate_skill_insights(profiles)
    exp_data = experience_distribution(profiles)
    cluster_data = cluster_summary(profiles)

    return {
        "summary": {
            "total_candidates": len(profiles),
            "avg_experience": exp_data["average_experience"],
            "top_skill": skill_data["top_skills"][0][0] if skill_data["top_skills"] else None
        },
        "skills_chart": {
            "labels": [s[0] for s in skill_data["top_skills"]],
            "values": [s[1] for s in skill_data["top_skills"]]
        },
        "experience_chart": {
            "average": exp_data["average_experience"],
            "min": exp_data["min_experience"],
            "max": exp_data["max_experience"]
        },
        "clusters": cluster_data
    }