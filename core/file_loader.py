import os

from core.pdf_reader import extract_text_from_pdf
from core.docx_reader import extract_text_from_docx
from core.txt_reader import extract_text_from_txt


def load_resumes(resume_folder_path):
    resumes = {}

    for filename in os.listdir(resume_folder_path):
        file_path = os.path.join(resume_folder_path, filename)
        ext = os.path.splitext(filename)[1].lower()

        text = ""

        if ext == ".pdf":
            text = extract_text_from_pdf(file_path)

        elif ext == ".docx":
            text = extract_text_from_docx(file_path)

        elif ext == ".txt":
            text = extract_text_from_txt(file_path)

        else:
            print(f"Unsupported file type: {filename}")
            continue

        if text.strip():
            resumes[filename] = text
        else:
            print(f"⚠ Skipping empty resume: {filename}")

    return resumes