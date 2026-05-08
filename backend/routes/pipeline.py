from fastapi import APIRouter
import os

router = APIRouter()

@router.post("/")
def run_pipeline():
    print("\n🚀 Starting Full Pipeline...\n")

    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

    command = f'cd /d "{ROOT_DIR}" && python -m pipelines.full_pipeline'

    os.system(command)

    print("\n✅ Pipeline Completed Successfully!\n")

    return {"message": "Pipeline executed successfully"}