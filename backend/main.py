from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# This line is required — creates the 'app' variable
app = FastAPI(title="OptiHedge Backend")

# Optional but recommended for frontend connection
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