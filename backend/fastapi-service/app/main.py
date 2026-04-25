from fastapi import FastAPI
from app.api.analyze import router as analyze_router

app=FastAPI(title="demo")

app.include_router(analyze_router)

@app.get("/health")
def health():
    return {"status": "ok"}
