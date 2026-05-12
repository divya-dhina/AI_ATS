
from database.db import get_connection
import json
import pandas as pd

def clear_results_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        TRUNCATE 
            candidates,
            skill_profiles,
            semantic_ranking,
            final_ranking,
            llm_evaluation,
            dari_insights,
            shap_explanations
        RESTART IDENTITY CASCADE;
    """)

    conn.commit()
    cursor.close()
    conn.close()

def map_candidate_to_id(name, df):
    row = df[df["candidate"] == name]
    return int(row["candidate_id"].values[0]) if not row.empty else None


def insert_candidates(skill_profiles):

    conn = get_connection()
    cursor = conn.cursor()

    candidate_map = {}

    for profile in skill_profiles:
        name = profile["candidate"]

        cursor.execute("""
            INSERT INTO candidates (resume_name)
            VALUES (%s)
            ON CONFLICT (resume_name) DO NOTHING
            RETURNING id
        """, (name,))

        result = cursor.fetchone()

        if result:
            candidate_id = result[0]
        else:
            cursor.execute("SELECT id FROM candidates WHERE resume_name=%s", (name,))
            candidate_id = cursor.fetchone()[0]

        candidate_map[name] = candidate_id

    conn.commit()
    cursor.close()
    conn.close()

    return candidate_map


def insert_skill_profiles(skill_profiles, candidate_map):

    conn = get_connection()
    cursor = conn.cursor()

    for profile in skill_profiles:

        cid = candidate_map[profile["candidate"]]

        cursor.execute("""
            INSERT INTO skill_profiles (
                candidate_id, skills, skill_score,
                experience_years, certifications, projects
            )
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            cid,
            profile["skills"],
            float(profile["skill_score"]),
            float(profile["experience_years"]),
            profile["certifications"],
            json.dumps(profile["projects"])
        ))

    conn.commit()
    cursor.close()
    conn.close()

import pandas as pd

def insert_semantic_ranking(csv_path, candidate_map):

    df = pd.read_csv(csv_path)

    conn = get_connection()
    cursor = conn.cursor()

    for _, row in df.iterrows():

        cid = candidate_map.get(row["Resume"])
        if not cid:
            continue

        cursor.execute("""
            INSERT INTO semantic_ranking (
                candidate_id, match_score, tier, decision
            )
            VALUES (%s, %s, %s, %s)
        """, (
            cid,
            float(row["Match_Score (%)"]),
            row.get("Tier", ""),
            row.get("Decision", "")
        ))

    conn.commit()
    cursor.close()
    conn.close()

def insert_final_ranking(df):
    conn = get_connection()
    cursor = conn.cursor()

    for _, row in df.iterrows():
        # Replace row["Resume"] with row["candidate_id"]
        cursor.execute("""
            INSERT INTO final_ranking(
                candidate_id,
                resume_name,
                semantic_score,
                skill_score,
                experience_score,
                certification_score,
                project_score,
                final_score,
                is_shortlisted
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            row["candidate_id"],
            row["resume_name"],
            row["semantic_score"],
            row["skill_score"],
            row["experience_score"],
            row["certification_score"],
            row["project_score"],
            row["final_score"],
            row["is_shortlisted"]
        ))

    conn.commit()
    conn.close()


import json

def insert_llm_results(file_path, candidate_map):
    conn = get_connection()
    cursor = conn.cursor()

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for item in data:

        candidate_name = item.get("candidate")
        candidate_id = candidate_map.get(candidate_name)

        if not candidate_id:
            continue

        cursor.execute("""
            INSERT INTO llm_evaluation (
                candidate_id,
                match_level,
                strengths,
                weaknesses,
                reasoning,
                recommendation
            )
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            candidate_id,
            item.get("match_level"),

            # 🔥 FIX HERE
            json.dumps(item.get("strengths", [])),
            json.dumps(item.get("weaknesses", [])),

            item.get("reasoning"),
            item.get("recommendation")
        ))

    conn.commit()
    cursor.close()
    conn.close()

def insert_dari_insights(insights_json_path):

    with open(insights_json_path, "r") as f:
        data = json.load(f)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO dari_insights (
            total_candidates,
            avg_experience,
            top_skill,
            full_insights
        )
        VALUES (%s, %s, %s, %s)
    """, (
        data["summary"]["total_candidates"],
        data["summary"]["avg_experience"],
        data["summary"]["top_skill"],
        json.dumps(data)   # 🔥 FULL JSON STORED
    ))

    conn.commit()
    cursor.close()
    conn.close()


def insert_shap_results(shap_results, df):
    conn = get_connection()
    cursor = conn.cursor()

    for item in shap_results:
        candidate_name = item["candidate"]
        fc = item["feature_contributions"]

        candidate_id = map_candidate_to_id(candidate_name, df)
        
        if not candidate_id:
            continue

        cursor.execute("""
            INSERT INTO shap_explanations (
                candidate_id,
                semantic_score,
                skill_score,
                experience_score,
                certification_score,
                project_score
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (candidate_id) DO UPDATE SET
                semantic_score = EXCLUDED.semantic_score,
                skill_score = EXCLUDED.skill_score,
                experience_score = EXCLUDED.experience_score,
                certification_score = EXCLUDED.certification_score,
                project_score = EXCLUDED.project_score
        """, (
            candidate_id,
            fc.get("Semantic_Score", 0),
            fc.get("Skill_Score", 0),
            fc.get("Experience_Score", 0),
            fc.get("Certification_Score", 0),
            fc.get("Project_Score", 0),
        ))

    conn.commit()
    conn.close()
