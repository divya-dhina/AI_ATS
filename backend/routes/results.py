from fastapi import APIRouter
import pandas as pd
import os
from database.db import get_connection

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@router.get("/ranking")
def get_ranking():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM final_ranking
        ORDER BY final_score DESC
    """)
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]

    conn.close()

    # Return each row as a dictionary
    return [dict(zip(columns, row)) for row in rows]


@router.get("/dashboard")
def get_dashboard():
    conn = get_connection()
    cursor = conn.cursor()

    # Total candidates
    cursor.execute("SELECT COUNT(*) FROM final_ranking")
    total = cursor.fetchone()[0]

    # Top score
    cursor.execute("SELECT MAX(final_score) FROM final_ranking")
    top_score = cursor.fetchone()[0]

    # -------------------------
    # Shortlisted candidates
    # -------------------------
    cursor.execute("""
        SELECT *
        FROM final_ranking
        WHERE is_shortlisted = TRUE
        ORDER BY final_score DESC
    """)
    shortlisted_rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]

    shortlisted = [dict(zip(columns, r)) for r in shortlisted_rows]

    # -------------------------
    # If none shortlisted → get top 3
    # -------------------------
    top_candidates = []
    message = None

    if len(shortlisted) == 0:
        message = "No candidates meet the required criteria. Showing top 3 candidates."

        cursor.execute("""
            SELECT *
            FROM final_ranking
            ORDER BY final_score DESC
            LIMIT 3
        """)
        top_rows = cursor.fetchall()
        top_candidates = [dict(zip(columns, r)) for r in top_rows]

    conn.close()

    return {
        "total_candidates": total,
        "top_score": top_score,
        "shortlisted": shortlisted,
        "top_candidates": top_candidates,  # ✅ NEW
        "message": message                # ✅ NEW
    }

@router.get("/candidate/{candidate_id}")
def get_candidate(candidate_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    # ── LLM DATA ──
    cursor.execute("""
        SELECT *
        FROM llm_evaluation
        WHERE candidate_id = %s
    """, (candidate_id,))
    
    llm_row = cursor.fetchone()
    llm_columns = [desc[0] for desc in cursor.description]

    # ── SHAP DATA ──
    cursor.execute("""
        SELECT *
        FROM shap_explanations
        WHERE candidate_id = %s
    """, (candidate_id,))
    
    shap_row = cursor.fetchone()
    shap_columns = [desc[0] for desc in cursor.description]

    conn.close()

    if not llm_row:
        return {"error": "Candidate not found"}

    return {
        "llm": dict(zip(llm_columns, llm_row)),
        "shap": dict(zip(shap_columns, shap_row)) if shap_row else None
    }