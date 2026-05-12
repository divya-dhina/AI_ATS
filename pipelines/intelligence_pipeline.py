import os
import json
import sys

from core.file_loader import load_resumes
from modules.skill_intelligence.education_extractor import extract_education
from modules.skill_intelligence.skill_pipeline import run_skill_intelligence
from modules.skill_intelligence.experience_extractor import extract_experience
from modules.skill_intelligence.certification_extractor import extract_certifications
from modules.skill_intelligence.project_extractor import extract_projects


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

RESUME_DIR = os.path.join(BASE_DIR, "..", "data", "resumes")
OUTPUT_PATH = os.path.join(BASE_DIR, "..", "outputs", "skill_profiles.json")


def main():

    resumes = load_resumes(RESUME_DIR)

    all_profiles = []

    for name, text in resumes.items():

        # existing skill intelligence
        result = run_skill_intelligence(name, text)

        # experience extraction
        experience_years = extract_experience(text)

        # certification extraction
        certifications = extract_certifications(text)

        #project extraction
        projects = extract_projects(text)

        # education extraction
        education = extract_education(text)

        # add to result dictionary
        result["experience_years"] = experience_years
        result["certifications"] = certifications
        result["projects"] = projects
        result["education"] = education

        all_profiles.append(result)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_profiles, f, indent=4)

    print("\n✅ Skill intelligence output saved to outputs/skill_profiles.json")


if __name__ == "__main__":
    main()