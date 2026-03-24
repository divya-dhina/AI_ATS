import re
import spacy

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Curated skill set
SKILL_SET = {
    # programming
    "python", "java", "c++", "javascript", "sql",

    # backend
    "spring", "spring boot", "django", "flask", "node.js",

    # APIs
    "rest", "rest api", "microservices",

    # databases
    "postgresql", "mysql", "mongodb",

    # devops
    "docker", "kubernetes", "ci/cd", "jenkins",

    # cloud
    "aws", "azure", "gcp", "cloud",

    # frontend
    "react", "html", "css",

    # data/ai
    "machine learning", "deep learning", "nlp",
    "pandas", "numpy", "tensorflow", "pytorch"
}


def extract_skills(text: str):

    doc = nlp(text.lower())

    found_skills = set()

    # Token level matching
    for token in doc:
        if token.text in SKILL_SET:
            found_skills.add(token.text)

    # Phrase level matching (important for multi-word skills)
    for skill in SKILL_SET:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text.lower()):
            found_skills.add(skill)

    return list(found_skills)