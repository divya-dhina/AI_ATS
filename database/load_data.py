from database.insert_data import (
    insert_candidates,
    insert_skill_profiles,
    insert_semantic_ranking,
    insert_final_ranking,
    insert_llm_results,
    insert_dari_insights
)

import json

from database.db import get_connection

def clear_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        TRUNCATE 
            candidates,
            skill_profiles,
            semantic_ranking,
            final_ranking,
            llm_evaluation,
            dari_insights
        RESTART IDENTITY CASCADE;
    """)

    conn.commit()
    cursor.close()
    conn.close()

def load_all_data():

    clear_tables()

    with open("outputs/skill_profiles.json") as f:
        skill_profiles = json.load(f)

    candidate_map = insert_candidates(skill_profiles)

    insert_skill_profiles(skill_profiles, candidate_map)

    insert_semantic_ranking("outputs/semantic_ranking.csv", candidate_map)

    insert_final_ranking("outputs/final_ranking.csv", candidate_map)

    insert_llm_results("outputs/llm_evaluation.json", candidate_map)

    insert_dari_insights("outputs/dari_insights.json")

    print("✅ Data loaded into PostgreSQL")