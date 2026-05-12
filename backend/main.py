from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import upload, pipeline, results, insights, auth
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# ✅ CORS (REQUIRED for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register routes
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(pipeline.router, prefix="/process", tags=["Process"])
app.include_router(results.router, prefix="/results", tags=["Results"])
app.include_router(insights.router, prefix="/insights", tags=["Insights"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")
app.mount("/resumes", StaticFiles(directory="data/resumes"), name="resumes")# new line
