def compute_skill_match(resume_skills, jd_skills):

    if not resume_skills or not jd_skills:
        return 0

    resume_set = set([s.lower() for s in resume_skills])
    jd_set = set([s.lower() for s in jd_skills])

    matched = resume_set.intersection(jd_set)

    # How much of JD is covered
    jd_coverage = len(matched) / len(jd_set)

    # How relevant candidate skillset is
    resume_relevance = len(matched) / len(resume_set)

    # combine both
    score = (0.7 * jd_coverage + 0.3 * resume_relevance) * 100

    return round(score, 2)

def compute_experience_score(years):
    # Normalize to 10 years max
    return min(years, 10) * 10  # 10 years → 100 score


def compute_certification_score(certifications):
    if not certifications:
        return 0

    # very small bonus
    return min(len(certifications) * 2, 6)

def compute_project_score(projects):

    if not projects:
        return 0

    score = 0

    for project in projects:

        techs = project.get("technologies", [])

        if not techs:
            score += 2
        else:
            score += min(len(techs) * 3, 10)

    return min(score, 20)


def compute_final_score(semantic_score, skill_score, exp_score, cert_score):
    return (
        0.5 * semantic_score +
        0.2 * skill_score +
        0.2 * exp_score +
        0.1 * cert_score
    )