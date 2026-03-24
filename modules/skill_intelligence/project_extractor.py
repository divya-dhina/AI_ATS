import re

PROJECT_HEADERS = [
    "projects",
    "personal projects",
    "academic projects",
    "project experience"
]

STOP_HEADERS = [
    "experience",
    "education",
    "skills",
    "certifications",
    "contact"
]

TECH_KEYWORDS = [
    "python","java","spring","spring boot","react","angular",
    "django","flask","mysql","postgresql","mongodb","docker",
    "aws","azure","rest","api","machine learning",
    "html","css","javascript","sql"
]


def extract_projects(text: str):

    text_lower = text.lower()

    # locate project section
    start = None
    for header in PROJECT_HEADERS:
        idx = text_lower.find(header)
        if idx != -1:
            start = idx
            break

    if start is None:
        return []

    project_block = text_lower[start:]

    # stop at next section
    for stop in STOP_HEADERS:
        stop_idx = project_block.find(stop)
        if stop_idx > 0:
            project_block = project_block[:stop_idx]
            break

    lines = [l.strip() for l in project_block.split("\n") if len(l.strip()) > 3]

    projects = []
    current_project = None

    for line in lines:

        if "project" in line:
            continue

        # detect project title (short line, not sentence)
        if len(line.split()) <= 4 and current_project is None:
            current_project = {
                "title": line,
                "description": "",
                "technologies": []
            }
            continue

        if current_project:

            current_project["description"] += " " + line

    if current_project:
        desc = current_project["description"]

        # detect technologies from description
        techs = [tech for tech in TECH_KEYWORDS if tech in desc]

        current_project["technologies"] = techs
        current_project["description"] = desc.strip()

        projects.append(current_project)

    return projects