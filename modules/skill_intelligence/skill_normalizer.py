SYNONYM_MAP = {
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "js": "javascript",
    "nodejs": "node.js"
}

def normalize_skills(skills):
    normalized = []

    for skill in skills:
        if skill in SYNONYM_MAP:
            normalized.append(SYNONYM_MAP[skill])
        else:
            normalized.append(skill)

    return list(set(normalized))