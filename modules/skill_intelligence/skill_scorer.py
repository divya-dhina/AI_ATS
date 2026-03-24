from .skill_weights import SKILL_WEIGHTS

def calculate_skill_score(skills):

    score = 0

    for skill in skills:

        if skill in SKILL_WEIGHTS:
            score += SKILL_WEIGHTS[skill]

        else:
            score += 1

    return score