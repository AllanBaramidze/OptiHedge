from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import StringIO

app = FastAPI(title="OptiHedge Backend")

# CORS so Next.js (localhost:3000) can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "OptiHedge FastAPI backend is running"}

@app.post("/analyze-portfolio/")
async def analyze_portfolio(data: dict):
    holdings = data.get("holdings", [])
    # Later: real analysis
    return {
        "message": "Portfolio received",
        "holdings_count": len(holdings),
        "received": holdings
    }