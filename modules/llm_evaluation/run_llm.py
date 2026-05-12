from concurrent.futures import ThreadPoolExecutor
from modules.llm_evaluation.evaluator import evaluate_candidate


def run_llm_analysis(candidates, job_description, ranking_df):

    results = []

    for idx, candidate in enumerate(candidates, start=1):
        candidate["index"] = idx

    def process_candidate(candidate):

        print(f"\n🔍 Evaluating Resume {candidate['index']}: {candidate['candidate']}")

        name = candidate["candidate"]
        row = ranking_df[ranking_df["Resume"] == name]

        if row.empty:
            return None

        semantic_score = float(row["Semantic_Score"].values[0])
        final_score = float(row["Final_Score"].values[0])
        shortlisted = row["is_shortlisted"].values[0]

        return evaluate_candidate(
            candidate,
            job_description,
            semantic_score,
            final_score,
            shortlisted
        )

    with ThreadPoolExecutor(max_workers=2) as executor:
        outputs = executor.map(process_candidate, candidates)

    for result in outputs:
        if result:
            results.append(result)

    return results