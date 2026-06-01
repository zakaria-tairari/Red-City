from fastapi import FastAPI
from pipelines.run_full_pipeline import run_full_pipeline

app = FastAPI()

@app.get("/")
def home():
    return {
        "service": "Red City Data Engine",
        "status": "running"
    }

@app.post("/run-pipeline")
def run_pipeline():
    return run_full_pipeline()

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "data-engine"
    }