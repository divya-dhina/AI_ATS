from fastapi import APIRouter, UploadFile, File
import os
import shutil

router = APIRouter()

# ✅ ROOT DIRECTORY
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

UPLOAD_DIR = os.path.join(ROOT_DIR, "data", "resumes")
JD_DIR = os.path.join(ROOT_DIR, "data", "job_descriptions")
JD_PATH = os.path.join(JD_DIR, "jd.txt")


@router.post("/")
async def upload_files(
    jd: UploadFile = File(...),
    resumes: list[UploadFile] = File(...)
):
    try:
        # ✅ Create folders if not exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        os.makedirs(JD_DIR, exist_ok=True)

        # ✅ Clear old resumes (IMPORTANT)
        if os.path.exists(UPLOAD_DIR):
            shutil.rmtree(UPLOAD_DIR)
            os.makedirs(UPLOAD_DIR)

        # ✅ Save JD
        with open(JD_PATH, "wb") as f:
            f.write(await jd.read())

        # ✅ Save resumes
        for file in resumes:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as f:
                f.write(await file.read())

        print(f"✅ Saved {len(resumes)} resumes")
        print(f"📄 JD saved at {JD_PATH}")

        return {"message": "Files uploaded successfully"}

    except Exception as e:
        print("❌ Upload Error:", str(e))
        return {"error": str(e)}