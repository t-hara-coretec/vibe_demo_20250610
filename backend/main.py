# main.py - FastAPI backend for Speech-to-Text App
import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.background import BackgroundTasks
from dotenv import load_dotenv
from backend.utils import split_mp3_if_needed, delete_file

app = FastAPI()
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "temp_uploads"
RESULTS_DIR = "transcripts"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# --- Simulate job state ---
jobs = {}

@app.post("/upload")
async def upload_audio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext != ".mp3":
        raise HTTPException(status_code=400, detail="Only MP3 files supported.")

    job_id = str(uuid.uuid4())
    save_path = os.path.join(UPLOAD_DIR, f"{job_id}.mp3")
    with open(save_path, "wb") as out:
        shutil.copyfileobj(file.file, out)
    
    jobs[job_id] = {"status": "processing"}

    background_tasks.add_task(process_audio, save_path, job_id)
    return {"job_id": job_id}

import httpx

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
WHISPER_API_URL = "https://api.openai.com/v1/audio/transcriptions"

def process_audio(file_path: str, job_id: str):
    try:
        # Check file size and split if too large
        mp3_parts = split_mp3_if_needed(file_path)
        transcript_text = ""
        for mp3_part in mp3_parts:
            with open(mp3_part, "rb") as audio_file:
                files = {"file": (os.path.basename(mp3_part), audio_file, "audio/mpeg")}
                data = {"model": "whisper-1"}
                headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
                response = httpx.post(WHISPER_API_URL, data=data, files=files, headers=headers, timeout=180)
                response.raise_for_status()
                transcript_json = response.json()
                transcript_text += transcript_json.get("text", "") + "\n"
        result_path = os.path.join(RESULTS_DIR, f"{job_id}.txt")
        with open(result_path, "w") as f:
            f.write(transcript_text.strip())
        jobs[job_id] = {"status": "done"}
    except Exception as e:
        jobs[job_id] = {"status": "error", "message": str(e)}
    finally:
        delete_file(file_path)

@app.get("/status/{job_id}")
def get_status(job_id: str):
    job = jobs.get(job_id)
    if not job:
        return JSONResponse(status_code=404, content={"error": "Job not found"})
    return job

@app.get("/download/{job_id}")
def download_transcript(job_id: str):
    result_path = os.path.join(RESULTS_DIR, f"{job_id}.txt")
    if not os.path.exists(result_path):
        return JSONResponse(status_code=404, content={"error": "Transcript not found"})
    return FileResponse(result_path, filename=f"transcript_{job_id}.txt")
