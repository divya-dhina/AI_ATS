from modules.skill_intelligence.skill_extractor import extract_skills

text = """
Built a machine learning model using Python, TensorFlow
and deployed using Docker on AWS.
"""

print(extract_skills(text))