from concurrent.futures import ThreadPoolExecutor
from modules.llm_evaluation.evaluator import evaluate_candidate


def run_llm_analysis(candidates, job_description, ranking_df):

    results = []

    def process_candidate(candidate):

        name = candidate["candidate"]
        row = ranking_df[ranking_df["Resume"] == name]

        if row.empty:
            return None

        semantic_score = float(row["Semantic_Score"].values[0])
        final_score = float(row["Final_Score"].values[0])

        return evaluate_candidate(
            candidate,
            job_description,
            semantic_score,
            final_score
        )

    with ThreadPoolExecutor(max_workers=3) as executor:
        outputs = executor.map(process_candidate, candidates)

    for result in outputs:
        if result:
            results.append(result)

    return results