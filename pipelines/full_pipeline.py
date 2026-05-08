import os

def run_full_pipeline():

    print("\n🚀 Starting Full Pipeline...\n")

    # ✅ Run as MODULES (VERY IMPORTANT)
    print("Running Semantic Pipeline...")
    os.system("python -m pipelines.semantic_pipeline")

    print("Running Intelligence Pipeline...")
    os.system("python -m pipelines.intelligence_pipeline")

    print("Running Ranking Pipeline...")
    os.system("python -m pipelines.ranking_pipeline")

    print("\n✅ Pipeline Completed Successfully!\n")


if __name__ == "__main__":
    run_full_pipeline()