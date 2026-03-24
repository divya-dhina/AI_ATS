import spacy
import re

nlp = spacy.load("en_core_web_sm")

DEGREE_KEYWORDS = [
    "b.tech", "m.tech", "bachelor", "master",
    "bsc", "msc", "phd", "mba", "b.e"
]

UNIVERSITY_HINTS = [
    "university", "college", "institute", "school"
]


def extract_education(text: str):
    doc = nlp(text)
    education = []
    text_lower = text.lower()

    # 1️⃣ Extract degrees
    for degree in DEGREE_KEYWORDS:
        if degree in text_lower:
            education.append(degree)

    # 2️⃣ Extract universities only if they look like real institutions
    for ent in doc.ents:
        if ent.label_ == "ORG":
            ent_lower = ent.text.lower()

            if any(keyword in ent_lower for keyword in UNIVERSITY_HINTS):
                clean_text = " ".join(ent.text.split())
                education.append(clean_text)
    return list(set(education))