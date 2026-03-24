import shap
import pandas as pd


def generate_shap_explanations(df):

    feature_cols = [
        "Semantic_Score",
        "Skill_Score",
        "Experience_Score",
        "Certification_Score",
        "Project_Score"
    ]

    X = df[feature_cols]

    # Use simple linear explainer since scoring is linear
    explainer = shap.Explainer(lambda x: x.sum(axis=1), X)

    shap_values = explainer(X)

    explanations = []

    for i, resume in enumerate(df["Resume"]):

        contributions = dict(
            zip(feature_cols, shap_values.values[i])
        )

        explanations.append({
            "candidate": resume,
            "feature_contributions": contributions
        })

    return explanations