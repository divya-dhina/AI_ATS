from .skill_extractor import extract_skills
from .skill_scorer import calculate_skill_score
from .skill_normalizer import normalize_skills

def run_skill_intelligence(candidate_name, text):

    extracted_skills = extract_skills(text)

    normalized_skills = normalize_skills(extracted_skills)

    skill_score = calculate_skill_score(normalized_skills)

    result = {
        "candidate": candidate_name,
        "skills": normalized_skills,
        "skill_score": skill_score
    }

    return result