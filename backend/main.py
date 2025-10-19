from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import sqlite3
from datetime import datetime
import os

app = FastAPI(title="ARC AI Labs API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_PATH = "arc_labs.db"

def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            submission_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str
    submission_type: Optional[str] = "general"

@app.get("/")
async def root():
    return {"message": "ARC AI Labs API", "status": "online"}

@app.post("/api/contact")
async def submit_contact(form: ContactForm):
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO contact_submissions (name, email, message, submission_type) VALUES (?, ?, ?, ?)",
            (form.name, form.email, form.message, form.submission_type)
        )
        conn.commit()
        submission_id = cursor.lastrowid
        conn.close()
        
        return {
            "success": True,
            "message": "Thank you for your submission. We'll be in touch soon.",
            "submission_id": submission_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
