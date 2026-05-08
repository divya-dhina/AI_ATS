def shortlist_candidates(final_df, semantic_df, percentile=0.75):

    # ✅ Correct merge (same column name)
    df = final_df.merge(
        semantic_df[["Resume", "Decision"]],
        on="Resume",
        how="left"
    )

    # Normalize decision
    df["Decision"] = df["Decision"].str.lower()

    # Percentile threshold
    threshold = df["Final_Score"].quantile(percentile)

    # Apply strict conditions
    shortlisted = df[
        (df["Final_Score"] >= threshold) &
        (df["Decision"] == "selected")
    ]

    return shortlisted