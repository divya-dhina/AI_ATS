def shortlist_candidates(df, percentile=0.75):
    threshold = df["Final_Score"].quantile(percentile)
    return df[df["Final_Score"] >= threshold] 