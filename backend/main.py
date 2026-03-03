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

@app.post("/upload-portfolio/")
async def upload_portfolio(file: UploadFile = File(...)):
    # Basic validation
    if not file.filename.lower().endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are allowed")

    try:
        contents = await file.read()
        
        # Handle CSV
        if file.filename.lower().endswith('.csv'):
            # Decode bytes to string for pandas
            df = pd.read_csv(StringIO(contents.decode("utf-8")))
        else:
            # For .xlsx - requires openpyxl (install if missing)
            df = pd.read_excel(contents)

        # Create a simple preview
        preview = df.head(5).to_dict(orient="records")  # first 5 rows as list of dicts

        return {
            "filename": file.filename,
            "row_count": len(df),
            "columns": list(df.columns),
            "preview": preview,
            "message": "Portfolio file uploaded and parsed successfully"
        }
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File encoding issue - try saving as UTF-8 CSV")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        await file.close()