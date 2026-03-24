import os

def load_job_description(jd_folder="data/job_descriptions"):
    
    files = os.listdir(jd_folder)

    if not files:
        raise Exception("No job description found")

    jd_path = os.path.join(jd_folder, files[0])

    with open(jd_path, "r", encoding="utf-8") as f:
        jd_text = f.read()

    return jd_text