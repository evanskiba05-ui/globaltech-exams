# Run:     uvicorn main:app --reload

import pandas as pd
from fastapi import UploadFile, File
import io

import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import aiomysql
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import cm
from fastapi.responses import StreamingResponse

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ── Config ────────────────────────────────────────────────────────────────────
DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_PORT     = int(os.getenv("DB_PORT", 3306))
DB_USER     = os.getenv("DB_USER", "root")
# DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME     = os.getenv("DB_NAME", "globaltech_cbt")
SECRET_KEY  = os.getenv("SECRET_KEY", secrets.token_hex(32))
ALGORITHM   = "HS256"
TOKEN_EXPIRE = 60 * 8  # 3 hours

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="GlobalTech CBT API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer  = HTTPBearer()

# ── DB Pool ───────────────────────────────────────────────────────────────────
db_pool: aiomysql.Pool = None

@app.on_event("startup")
async def startup():
    global db_pool
    db_pool = await aiomysql.create_pool(
        host=DB_HOST, port=DB_PORT,
        user=DB_USER, password=DB_PASSWORD,
        db=DB_NAME, autocommit=True,
        cursorclass=aiomysql.DictCursor
    )
print("DATABASE NAME:", DB_NAME)

@app.on_event("shutdown")
async def shutdown():
    db_pool.close()
    await db_pool.wait_closed()

async def db():
    async with db_pool.acquire() as conn:
        async with conn.cursor() as cur:
            yield cur

# ── Auth Helpers ──────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_token(data: dict, expire_minutes: int = TOKEN_EXPIRE) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now() + timedelta(minutes=expire_minutes)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

async def get_current_student(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    cur=Depends(db)
):
    payload = decode_token(creds.credentials)
    if payload.get("role") != "student":
        raise HTTPException(status_code=403, detail="Students only")
    await cur.execute("SELECT * FROM students WHERE id=%s", (payload["id"],))
    student = await cur.fetchone()
    if not student:
        raise HTTPException(status_code=401, detail="Student not found")
    return {"student": student, "session_id": payload.get("session_id")}

async def get_current_admin(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    cur=Depends(db)
):
    payload = decode_token(creds.credentials)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    await cur.execute("SELECT * FROM admins WHERE id=%s", (payload["id"],))
    admin = await cur.fetchone()
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin

# ── Pydantic Models ───────────────────────────────────────────────────────────
class StudentLoginIn(BaseModel):
    exam_id: str
    password: str

class AdminLoginIn(BaseModel):
    username: str
    password: str
    remember_me: bool = False

class StartExamIn(BaseModel):
    subject_ids: list[int]

class AnswerIn(BaseModel):
    question_id: int
    option_id: Optional[int] = None

class CreateStudentIn(BaseModel):
    exam_id: str
    password: str
    full_name: str
    email: Optional[str] = None

class AddQuestionIn(BaseModel):
    subject_slug: str
    text: str
    options: dict[str, str]
    correct_letter: str

def calculate_grade(percentage: float) -> str:
    if percentage >= 80: return "A"
    elif percentage >= 70: return "B"
    elif percentage >= 60: return "C"
    elif percentage >= 50: return "D"
    else: return "F"

class CreateAdminIn(BaseModel):
    username: str
    password: str
    full_name: str
    email: Optional[str] = None
    role: str = "admin"
        
# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "GlobalTech CBT"}

# ── Auth ──────────────────────────────────────────────────────────────────────
@app.post("/api/auth/login")
async def student_login(body: StudentLoginIn, cur=Depends(db)):
    if not body.exam_id.strip() or not body.password.strip():
        raise HTTPException(status_code=400, detail="Exam ID and password are required")
    await cur.execute(
        "SELECT * FROM students WHERE exam_id=%s AND status='active'", (body.exam_id,)
    )
    student = await cur.fetchone()
    if not student or not verify_password(body.password, student["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"id": student["id"], "exam_id": student["exam_id"], "role": "student"})
    return {"token": token, "student": {"id": student["id"], "exam_id": student["exam_id"], "full_name": student["full_name"]}}


@app.post("/api/auth/admin/login")
async def admin_login(body: AdminLoginIn, cur=Depends(db)):
    if not body.username.strip() or not body.password.strip():
        raise HTTPException(status_code=400, detail="Username and password are required")
    await cur.execute("SELECT * FROM admins WHERE username=%s", (body.username,))
    admin = await cur.fetchone()
    if not admin or not verify_password(body.password, admin["password"]):
        if admin:
            await cur.execute(
                "INSERT INTO admin_sessions (admin_id, action) VALUES (%s, %s)",
                (admin["id"], "failed_login")
            )
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    remember_me = body.remember_me
    expire_minutes = 60 * 24 * 30 if remember_me else TOKEN_EXPIRE
    token = create_token({"id": admin["id"], "username": admin["username"], "role": "admin"}, expire_minutes)
    await cur.execute(
        "INSERT INTO admin_sessions (admin_id, action) VALUES (%s, %s)",
        (admin["id"], "login")
    )
    return {"token": token, "admin": {"username": admin["username"], "full_name": admin["full_name"], "email": admin["email"], "role": admin["role"]}}
    
# ── Subjects ──────────────────────────────────────────────────────────────────

@app.get("/api/subjects")
async def get_subjects(cur=Depends(db)):
    await cur.execute("""
        SELECT s.id, s.name, s.slug, s.icon, s.total_questions, s.duration_mins, 
               s.is_compulsory, s.is_active, s.created_at,
               COUNT(q.id) as question_count
        FROM subjects s
        LEFT JOIN questions q ON q.subject_id = s.id
        WHERE s.is_active=TRUE
        GROUP BY s.id
    """)
    rows = await cur.fetchall()
    return {"subjects": rows}



# ── Exam ──────────────────────────────────────────────────────────────────────
@app.post("/api/exam/start")
async def start_exam(body: StartExamIn, current=Depends(get_current_student), cur=Depends(db)):
    student = current["student"]
    subject_ids = body.subject_ids

    await cur.execute("SELECT id FROM subjects WHERE is_compulsory=TRUE LIMIT 1")
    compulsory = await cur.fetchone()
    if compulsory and compulsory["id"] not in subject_ids:
        subject_ids.insert(0, compulsory["id"])

    if len(subject_ids) < 4:
        raise HTTPException(status_code=400, detail="Select at least 3 subjects (English is compulsory)")

    token = secrets.token_hex(16)
    await cur.execute(
        "INSERT INTO exam_sessions (student_id, token) VALUES (%s, %s)",
        (student["id"], token)
    )
    session_id = cur.lastrowid

    for sid in subject_ids:
        await cur.execute(
            "INSERT IGNORE INTO session_subjects (session_id, subject_id) VALUES (%s, %s)",
            (session_id, sid)
        )

    # FIXED: Create new token with session_id
    new_token = create_token({
        "id": student["id"],
        "exam_id": student["exam_id"],
        "role": "student",
        "session_id": session_id
    })

    return {
        "session_id": session_id,
        "token": new_token,        # ← Important
        "message": "Exam started"
    }


@app.get("/api/exam/questions")
async def get_questions(
    subject_id: Optional[int] = None,
    current=Depends(get_current_student),
    cur=Depends(db)
):
    session_id = current.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="No active exam session")

    # 1. Fast randomized questions only
    q_query = """
        SELECT q.id, q.text, q.image_url, s.name as subject_name
        FROM questions q
        JOIN subjects s ON s.id = q.subject_id
        JOIN session_subjects ss ON ss.subject_id = q.subject_id
        WHERE ss.session_id = %s
    """
    args = [session_id]
    if subject_id:
        q_query += " AND q.subject_id = %s"
        args.append(subject_id)

    q_query += " ORDER BY RAND() LIMIT 300"   # safety + faster

    await cur.execute(q_query, args)
    q_rows = await cur.fetchall()

    if not q_rows:
        return {"questions": []}

    q_ids = [r["id"] for r in q_rows]

    # 2. Options only for these questions
    format_strings = ','.join(['%s'] * len(q_ids))
    await cur.execute(
        f"SELECT id, question_id, letter, text FROM options WHERE question_id IN ({format_strings}) ORDER BY question_id, letter",
        q_ids
    )
    opt_rows = await cur.fetchall()

    # 3. Student answers
    await cur.execute(
        "SELECT question_id, chosen_option_id FROM student_answers WHERE session_id=%s", 
        (session_id,)
    )
    answered = {r["question_id"]: r["chosen_option_id"] for r in await cur.fetchall()}

    # 4. Map options
    options_map = {}
    for opt in opt_rows:
        qid = opt["question_id"]
        if qid not in options_map:
            options_map[qid] = []
        options_map[qid].append({
            "id": opt["id"],
            "letter": opt["letter"],
            "text": opt["text"]
        })

    # 5. Final result (preserves random order)
    result = []
    for q in q_rows:
        qid = q["id"]
        result.append({
            "id": qid,
            "text": q["text"],
            "image_url": q["image_url"],
            "subject": q["subject_name"],
            "answered_option_id": answered.get(qid),
            "options": options_map.get(qid, [])
        })

    return {"questions": result}


@app.post("/api/exam/answer")
async def save_answer(body: AnswerIn, current=Depends(get_current_student), cur=Depends(db)):
    session_id = current.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="No active exam session")

    await cur.execute("SELECT is_submitted, started_at FROM exam_sessions WHERE id=%s", (session_id,))
    sess = await cur.fetchone()
    if not sess or sess["is_submitted"]:
        raise HTTPException(status_code=400, detail="Exam already submitted")
    
    # # Auto-submit if 2 hours have passed
    time_elapsed = datetime.now() - sess["started_at"]
    if time_elapsed.total_seconds() > 7200:  # 2 hours
        await cur.execute("""
            UPDATE exam_sessions
            SET is_submitted=TRUE, submitted_at=NOW()
            WHERE id=%s
        """, (session_id,))
        raise HTTPException(status_code=400, detail="Exam time expired. Exam has been submitted.")

    is_correct = False
    if body.option_id:
        await cur.execute(
            "SELECT is_correct FROM options WHERE id=%s AND question_id=%s",
            (body.option_id, body.question_id)
        )
        opt = await cur.fetchone()
        if not opt:
            raise HTTPException(status_code=400, detail="Invalid option")
        is_correct = opt["is_correct"]

    await cur.execute("""
        INSERT INTO student_answers (session_id, question_id, chosen_option_id, is_correct)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE chosen_option_id=VALUES(chosen_option_id), is_correct=VALUES(is_correct)
    """, (session_id, body.question_id, body.option_id, is_correct))

    return {"saved": True}


@app.post("/api/exam/submit")
async def submit_exam(current=Depends(get_current_student), cur=Depends(db)):
    session_id = current.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="No active session")

    await cur.execute("SELECT is_submitted FROM exam_sessions WHERE id=%s", (session_id,))
    sess = await cur.fetchone()
    if not sess or sess["is_submitted"]:
        raise HTTPException(status_code=400, detail="Already submitted")

    await cur.execute("""
        SELECT ss.subject_id, COALESCE(SUM(sa.is_correct), 0) as correct,
               sub.total_questions as total
        FROM session_subjects ss
        JOIN subjects sub ON sub.id = ss.subject_id
        LEFT JOIN student_answers sa ON sa.session_id = ss.session_id
            AND sa.question_id IN (SELECT id FROM questions WHERE subject_id = ss.subject_id)
        WHERE ss.session_id = %s
        GROUP BY ss.subject_id, sub.total_questions
    """, (session_id,))
    subject_scores = await cur.fetchall()

    total_score = sum(int(r["correct"]) for r in subject_scores)
    total_possible = sum(r["total"] for r in subject_scores)

    for row in subject_scores:
        await cur.execute(
            "UPDATE session_subjects SET score=%s WHERE session_id=%s AND subject_id=%s",
            (int(row["correct"]), session_id, row["subject_id"])
        )

    await cur.execute("""
        UPDATE exam_sessions
        SET is_submitted=TRUE, submitted_at=NOW(), total_score=%s, total_possible=%s
        WHERE id=%s
    """, (total_score, total_possible, session_id))

    pct = round((total_score / total_possible * 100), 1) if total_possible else 0
    return {"submitted": True, "total_score": total_score, "total_possible": total_possible, "percentage": pct}


#________________

@app.get("/api/exam/time")
async def get_time_remaining(current=Depends(get_current_student), cur=Depends(db)):
    session_id = current.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="No session")

    await cur.execute("SELECT started_at, is_submitted FROM exam_sessions WHERE id=%s", (session_id,))
    sess = await cur.fetchone()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")

    if sess["is_submitted"]:
        return {"time_remaining": 0, "expired": True}

    elapsed = (datetime.now() - sess["started_at"]).total_seconds()
    remaining = max(0, 7200 - elapsed)

    if remaining == 0:
        await cur.execute("""
            UPDATE exam_sessions
            SET is_submitted=TRUE, submitted_at=NOW()
            WHERE id=%s
        """, (session_id,))

    return {
        "time_remaining": int(remaining),
        "expired": remaining == 0
    }

#________________

@app.get("/api/exam/result")
async def get_result(current=Depends(get_current_student), cur=Depends(db)):
    session_id = current.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="No session")

    await cur.execute("SELECT * FROM exam_sessions WHERE id=%s", (session_id,))
    sess = await cur.fetchone()

    await cur.execute("""
        SELECT sub.name, sub.slug, sub.icon, sub.total_questions, ss.score,
               COUNT(sa.id) as answered,
               SUM(CASE WHEN sa.is_correct = 1 THEN 1 ELSE 0 END) as correct,
               SUM(CASE WHEN sa.is_correct = 0 AND sa.chosen_option_id IS NOT NULL THEN 1 ELSE 0 END) as wrong,
               SUM(CASE WHEN sa.chosen_option_id IS NULL THEN 1 ELSE 0 END) as unanswered
        FROM session_subjects ss
        JOIN subjects sub ON sub.id = ss.subject_id
        LEFT JOIN student_answers sa ON sa.session_id = ss.session_id
            AND sa.question_id IN (SELECT id FROM questions WHERE subject_id = ss.subject_id)
        WHERE ss.session_id = %s
        GROUP BY ss.subject_id, sub.name, sub.slug, sub.icon, sub.total_questions, ss.score
    """, (session_id,))
    subjects = await cur.fetchall()

    await cur.execute("""
        SELECT q.text as question, sa.is_correct,
               chosen.letter as chosen_letter, chosen.text as chosen_text,
               correct_opt.letter as correct_letter, correct_opt.text as correct_text
        FROM student_answers sa
        JOIN questions q ON q.id = sa.question_id
        LEFT JOIN options chosen ON chosen.id = sa.chosen_option_id
        JOIN options correct_opt ON correct_opt.question_id = q.id AND correct_opt.is_correct = TRUE
        WHERE sa.session_id = %s
    """, (session_id,))
    answers = await cur.fetchall()

    pct = round((sess["total_score"] / sess["total_possible"] * 100), 1) if sess["total_possible"] else 0

    # Fixed subject breakdown
    subject_results = []
    for sub in subjects:
        total = sub["total_questions"] or 0
        correct = int(sub["correct"] or 0)
        wrong = int(sub["wrong"] or 0)
        unanswered = total - correct - wrong          

        sub_pct = round((sub["score"] / total * 100), 1) if total else 0
        
        subject_results.append({
            "name": sub["name"],
            "slug": sub["slug"],
            "icon": sub["icon"],
            "total_questions": total,
            "score": sub["score"],
            "correct": correct,
            "wrong": wrong,
            "unanswered": unanswered,                 
            "percentage": sub_pct,
            "grade": calculate_grade(sub_pct),
        })
    
    return {
        "total_score": sess["total_score"],
        "total_possible": sess["total_possible"],
        "percentage": pct,
        "grade": calculate_grade(pct),
        "submitted_at": str(sess["submitted_at"]),
        "subject_breakdown": subject_results,
        "answers": answers
    }


#________________________PDF__________________________________________________________________


@app.get("/api/exam/result/pdf")
async def download_result_pdf(current=Depends(get_current_student), cur=Depends(db)):
    
    session_id = current.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="No session")

    await cur.execute("SELECT * FROM exam_sessions WHERE id=%s", (session_id,))
    sess = await cur.fetchone()
    if not sess or not sess["is_submitted"]:
        raise HTTPException(status_code=400, detail="Exam not submitted")

    await cur.execute("SELECT * FROM students WHERE id=%s", (sess["student_id"],))
    student = await cur.fetchone()

    await cur.execute("""
        SELECT sub.name, sub.total_questions, ss.score,
               SUM(CASE WHEN sa.is_correct = 1 THEN 1 ELSE 0 END) as correct,
               SUM(CASE WHEN sa.is_correct = 0 AND sa.chosen_option_id IS NOT NULL THEN 1 ELSE 0 END) as wrong,
               SUM(CASE WHEN sa.chosen_option_id IS NULL THEN 1 ELSE 0 END) as unanswered
        FROM session_subjects ss
        JOIN subjects sub ON sub.id = ss.subject_id
        LEFT JOIN student_answers sa ON sa.session_id = ss.session_id
            AND sa.question_id IN (SELECT id FROM questions WHERE subject_id = ss.subject_id)
        WHERE ss.session_id = %s
        GROUP BY ss.subject_id, sub.name, sub.total_questions, ss.score
    """, (session_id,))
    subjects = await cur.fetchall()

    pct = round((sess["total_score"] / sess["total_possible"] * 100), 1) if sess["total_possible"] else 0
    grade = calculate_grade(pct)

    # ── Build PDF ──
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=2*cm, leftMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    elements = []

    # Header
    elements.append(Paragraph("GlobalTech CBT", ParagraphStyle("title", fontSize=22, fontName="Helvetica-Bold", textColor=colors.HexColor("#1a3a8f"), alignment=1)))
    elements.append(Paragraph("JAMB Practice Examination — Result Slip", ParagraphStyle("sub", fontSize=12, textColor=colors.HexColor("#64748b"), alignment=1)))
    elements.append(Spacer(1, 0.5*cm))

    # Student info
    elements.append(Paragraph(f"<b>Student:</b> {student['full_name']}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Exam ID:</b> {student['exam_id']}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Date:</b> {str(sess['submitted_at'])[:10]}", styles["Normal"]))
    elements.append(Spacer(1, 0.5*cm))

    # Subject table
    table_data = [["Subject", "Score", "Total", "Correct", "Wrong", "Unanswered", "%", "Grade"]]
    for sub in subjects:
        sub_pct = round((sub["score"] / sub["total_questions"] * 100), 1) if sub["total_questions"] else 0
        table_data.append([
            sub["name"],
            str(sub["score"]),
            str(sub["total_questions"]),
            str(int(sub["correct"] or 0)),
            str(int(sub["wrong"] or 0)),
            str(int(sub["unanswered"] or 0)),
            f"{sub_pct}%",
            calculate_grade(sub_pct),
        ])

    table = Table(table_data, colWidths=[4*cm, 1.5*cm, 1.5*cm, 1.5*cm, 1.5*cm, 2*cm, 1.5*cm, 1.5*cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1a3a8f")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("ALIGN", (0,0), (0,-1), "LEFT"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ("PADDING", (0,0), (-1,-1), 6),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 0.5*cm))

    # Total score
    elements.append(Paragraph(f"<b>Total Score:</b> {sess['total_score']} / {sess['total_possible']}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Aggregate:</b> {pct}%", styles["Normal"]))
    elements.append(Paragraph(f"<b>Grade:</b> {grade}", styles["Normal"]))
    elements.append(Spacer(1, 1*cm))
    elements.append(Paragraph("Thank you for taking this examination. Good luck in the actual JAMB!", ParagraphStyle("footer", fontSize=9, textColor=colors.HexColor("#94a3b8"), alignment=1)))

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=result_{student['exam_id']}.pdf"}
    )

    
# ── Admin ─────────────────────────────────────────────────────────────────────
@app.get("/api/admin/students")
async def list_students(
    search: Optional[str] = None,
    status: Optional[str] = None,
    admin=Depends(get_current_admin),
    cur=Depends(db)
):
    query = """
    SELECT s.id, s.exam_id, s.full_name, s.email, s.status, s.created_at,
           COUNT(e.id) as exam_count
    FROM students s
    LEFT JOIN exam_sessions e ON e.student_id = s.id
    WHERE 1=1
"""
    args = []

    if search:
        query += " AND (full_name LIKE %s OR exam_id LIKE %s)"
        args.extend([f"%{search}%", f"%{search}%"])

    if status and status in ["active", "inactive", "suspended"]:
        query += " AND status=%s"
        args.append(status)

    query += " GROUP BY s.id ORDER BY s.created_at DESC"
    await cur.execute(query, args)
    rows = await cur.fetchall()
    return {"students": rows}


@app.post("/api/admin/students", status_code=201)
async def create_student(body: CreateStudentIn, admin=Depends(get_current_admin), cur=Depends(db)):
    try:
        await cur.execute(
            "INSERT INTO students (exam_id, password, full_name, email) VALUES (%s,%s,%s,%s)",
            (body.exam_id, hash_password(body.password), body.full_name, body.email)
        )
        return {"created": True, "exam_id": body.exam_id}
    except Exception:
        raise HTTPException(status_code=409, detail="exam_id already exists")



class UpdateStudentIn(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


@app.put("/api/admin/students/{student_id}")
async def update_student(student_id: int, body: UpdateStudentIn, admin=Depends(get_current_admin), cur=Depends(db)):
    await cur.execute("SELECT id FROM students WHERE id=%s", (student_id,))
    if not await cur.fetchone():
        raise HTTPException(status_code=404, detail="Student not found")

    updates = []
    values = []

    if body.full_name:
        updates.append("full_name=%s")
        values.append(body.full_name)
    if body.email:
        updates.append("email=%s")
        values.append(body.email)
    if body.password:
        updates.append("password=%s")
        values.append(hash_password(body.password))

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    values.append(student_id)
    await cur.execute(f"UPDATE students SET {', '.join(updates)} WHERE id=%s", values)
    return {"updated": True}


@app.post("/api/admin/students/import")
async def import_students(file: UploadFile = File(...), admin=Depends(get_current_admin), cur=Depends(db)):
    if not file.filename.endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")

    contents = await file.read()

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read file")

    required_columns = {"full_name", "username", "email", "password"}
    if not required_columns.issubset(df.columns):
        raise HTTPException(status_code=400, detail=f"Missing columns. Required: {required_columns}")

    created = 0
    skipped = 0
    errors = []

    for _, row in df.iterrows():
        try:
            await cur.execute(
                "INSERT INTO students (exam_id, password, full_name, email) VALUES (%s,%s,%s,%s)",
                (str(row["username"]).strip(), hash_password(str(row["password"]).strip()),
                 str(row["full_name"]).strip(), str(row["email"]).strip())
            )
            created += 1
        except Exception:
            skipped += 1
            errors.append(str(row.get("username", "unknown")))

    return {"created": created, "skipped": skipped, "errors": errors}


@app.get("/api/admin/students/template")
async def download_template(admin=Depends(get_current_admin)):
    df = pd.DataFrame(columns=["full_name", "username", "email", "password"])
    df.loc[0] = ["Adaeze Okonkwo", "GT2026-00123", "adaeze@email.com", "password123"]
    
    buffer = io.BytesIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students_template.csv"}
    )


@app.post("/api/admin/questions", status_code=201)
async def add_question(body: AddQuestionIn, admin=Depends(get_current_admin), cur=Depends(db)):
    await cur.execute("SELECT id FROM subjects WHERE slug=%s", (body.subject_slug,))
    subject = await cur.fetchone()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    await cur.execute(
        "INSERT INTO questions (subject_id, text) VALUES (%s,%s)",
        (subject["id"], body.text)
    )
    question_id = cur.lastrowid

    for letter, text in body.options.items():
        await cur.execute(
            "INSERT INTO options (question_id, letter, text, is_correct) VALUES (%s,%s,%s,%s)",
            (question_id, letter.upper(), text, letter.upper() == body.correct_letter.upper())
        )
    return {"created": True, "question_id": question_id}

#____________________________edit_question_____________________________

@app.put("/api/admin/questions/{question_id}")
async def edit_question(question_id: int, body: AddQuestionIn, admin=Depends(get_current_admin), cur=Depends(db)):
    await cur.execute("SELECT id FROM questions WHERE id=%s", (question_id,))
    q = await cur.fetchone()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    await cur.execute("SELECT id FROM subjects WHERE slug=%s", (body.subject_slug,))
    subject = await cur.fetchone()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Update question text and year
    await cur.execute(
        "UPDATE questions SET text=%s, subject_id=%s WHERE id=%s",
        (body.text, subject["id"], question_id)
    )

    # Delete old options and re-insert
    await cur.execute("DELETE FROM options WHERE question_id=%s", (question_id,))
    for letter, text in body.options.items():
        await cur.execute(
            "INSERT INTO options (question_id, letter, text, is_correct) VALUES (%s,%s,%s,%s)",
            (question_id, letter.upper(), text, letter.upper() == body.correct_letter.upper())
        )

    return {"updated": True, "question_id": question_id}

#_____________________________________________________________________________

@app.post("/api/admin/questions/bulk-upload")
async def bulk_upload_questions(file: UploadFile = File(...), admin=Depends(get_current_admin), cur=Depends(db)):
    if not file.filename.endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")

    contents = await file.read()

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read file")

    required_columns = {"question_text", "subject", "option_a", "option_b", "option_c", "option_d", "correct_answer"}
    if not required_columns.issubset(df.columns):
        raise HTTPException(status_code=400, detail=f"Missing columns. Required: {required_columns}")

    if len(df) > 500:
        raise HTTPException(status_code=400, detail="Maximum 500 questions per upload")

    created = 0
    skipped = 0
    errors = []

    for _, row in df.iterrows():
        try:
            await cur.execute("SELECT id FROM subjects WHERE slug=%s OR name=%s",
                              (str(row["subject"]).strip().lower().replace(" ", "_"), str(row["subject"]).strip()))
            subject = await cur.fetchone()
            if not subject:
                skipped += 1
                errors.append(f"Subject not found: {row['subject']}")
                continue

            await cur.execute(
                "INSERT INTO questions (subject_id, text) VALUES (%s,%s)",
                (subject["id"], str(row["question_text"]).strip())
            )
            
            question_id = cur.lastrowid

            correct = str(row["correct_answer"]).strip().upper()
            options = {
                "A": str(row["option_a"]).strip(),
                "B": str(row["option_b"]).strip(),
                "C": str(row["option_c"]).strip(),
                "D": str(row["option_d"]).strip(),
            }
            for letter, text in options.items():
                await cur.execute(
                    "INSERT INTO options (question_id, letter, text, is_correct) VALUES (%s,%s,%s,%s)",
                    (question_id, letter, text, letter == correct)
                )
            created += 1
        except Exception as e:
            skipped += 1
            errors.append(str(e))

    return {"created": created, "skipped": skipped, "errors": errors}
    
#_________________________________________________________________________________

@app.get("/api/admin/questions/template")
async def download_questions_template(admin=Depends(get_current_admin)):
    df = pd.DataFrame(columns=["question_text", "subject", "option_a", "option_b", "option_c", "option_d", "correct_answer"])
    df.loc[0] = ["What is the chemical symbol for Gold?", "chemistry", "AU", "Ag", "Fe", "Cu", "A"]
    
    buffer = io.BytesIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=questions_template.csv"}
    )

# ____________________________________ add subject ______________________

@app.post("/api/admin/subjects", status_code=201)
async def create_subject(body: dict, admin=Depends(get_current_admin), cur=Depends(db)):
    name = body.get("name", "").strip()
    slug = body.get("slug", "").strip()
    icon = body.get("icon", "📖")
    total_questions = body.get("total_questions", 40)
    duration_mins = body.get("duration_mins", 30)
    is_compulsory = body.get("is_compulsory", False)

    if not name or not slug:
        raise HTTPException(status_code=400, detail="name and slug required")

    try:
        await cur.execute(
            "INSERT INTO subjects (name, slug, icon, total_questions, duration_mins, is_compulsory) VALUES (%s,%s,%s,%s,%s,%s)",
            (name, slug, icon, total_questions, duration_mins, is_compulsory)
        )
        return {"created": True, "name": name}
    except Exception:
        raise HTTPException(status_code=409, detail="Subject already exists")

# ________________________________________________________________________

@app.delete("/api/admin/questions/{question_id}")
async def delete_question(question_id: int, admin=Depends(get_current_admin), cur=Depends(db)):
    await cur.execute("SELECT id FROM questions WHERE id=%s", (question_id,))
    q = await cur.fetchone()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    await cur.execute("DELETE FROM questions WHERE id=%s", (question_id,))
    return {"deleted": True, "question_id": question_id}


@app.get("/api/admin/questions")
async def get_all_questions(subject_slug: Optional[str] = None, cur=Depends(db), admin=Depends(get_current_admin)):
    query = """
        SELECT q.id, q.text, s.name as subject_name, s.slug as subject_slug
        FROM questions q
        JOIN subjects s ON s.id = q.subject_id
    """
    args = []
    if subject_slug:
        query += " WHERE s.slug = %s"
        args.append(subject_slug)
    query += " ORDER BY s.name, q.id"
    await cur.execute(query, args)
    rows = await cur.fetchall()

    # Attach options to each question
    question_ids = [q["id"] for q in rows]
    if question_ids:
        placeholders = ",".join("%s" for _ in question_ids)
        await cur.execute(
            f"SELECT * FROM options WHERE question_id IN ({placeholders}) ORDER BY question_id, letter",
            question_ids,
        )
        all_options = await cur.fetchall()
        options_map = {}
        for opt in all_options:
            options_map.setdefault(opt["question_id"], []).append(opt)
        for q in rows:
            q["options"] = options_map.get(q["id"], [])

    return {"questions": rows}

# _____________________________________________________________________
    
@app.get("/api/admin/results")
async def all_results(
    admin=Depends(get_current_admin),
    cur=Depends(db),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    subject_slug: Optional[str] = None
):
    query = """
        SELECT s.exam_id, s.full_name, e.started_at, e.submitted_at,
               e.total_score, e.total_possible, e.is_submitted,
               TIMEDIFF(e.submitted_at, e.started_at) as time_taken
        FROM exam_sessions e
        JOIN students s ON s.id = e.student_id
        WHERE e.is_submitted = TRUE
            AND (%s IS NULL OR EXISTS (
                SELECT 1 FROM session_subjects ss
                JOIN subjects sub ON sub.id = ss.subject_id
                WHERE ss.session_id = e.id AND sub.slug = %s
            ))
    """
    args = []
    args.extend([subject_slug, subject_slug])

    if date_from:
        query += " AND e.submitted_at >= %s"
        args.append(date_from)

    if date_to:
        query += " AND e.submitted_at <= %s"
        args.append(date_to)

    if search:
        query += " AND (s.full_name LIKE %s OR s.exam_id LIKE %s)"
        args.extend([f"%{search}%", f"%{search}%"])

    query += " ORDER BY e.submitted_at DESC"
    await cur.execute(query, args)
    results = await cur.fetchall()

    # Calculate stats
    total = len(results)
    passed = sum(1 for r in results if r["total_possible"] and (r["total_score"] / r["total_possible"] * 100) >= 45)
    failed = total - passed
    grade_a = sum(1 for r in results if r["total_possible"] and (r["total_score"] / r["total_possible"] * 100) >= 80)
    avg_score = round(sum((r["total_score"] / r["total_possible"] * 100) for r in results if r["total_possible"]) / total, 1) if total else 0

    # Add percentage and grade to each result
    formatted = []
    for r in results:
        pct = round((r["total_score"] / r["total_possible"] * 100), 1) if r["total_possible"] else 0
        formatted.append({
            "exam_id": r["exam_id"],
            "full_name": r["full_name"],
            "started_at": str(r["started_at"]),
            "submitted_at": str(r["submitted_at"]),
            "total_score": r["total_score"],
            "total_possible": r["total_possible"],
            "percentage": pct,
            "grade": calculate_grade(pct),
            "time_taken": r["time_taken"]
        })

    return {
        "stats": {
            "total": total,
            "passed": passed,
            "failed": failed,
            "grade_a": grade_a,
            "avg_score": avg_score
        },
        "results": formatted
    }

#____________________________________________________________________________________

@app.get("/api/admin/results/export/excel")
async def export_results_excel(
    admin=Depends(get_current_admin),
    cur=Depends(db),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    subject_slug: Optional[str] = None
):
    query = """
        SELECT s.exam_id, s.full_name, e.started_at, e.submitted_at,
               e.total_score, e.total_possible,
               TIMEDIFF(e.submitted_at, e.started_at) as time_taken
        FROM exam_sessions e
        JOIN students s ON s.id = e.student_id
        WHERE e.is_submitted = TRUE
            AND (%s IS NULL OR EXISTS (
                SELECT 1 FROM session_subjects ss
                JOIN subjects sub ON sub.id = ss.subject_id
                WHERE ss.session_id = e.id AND sub.slug = %s
            ))
    """
    args = []
    args.extend([subject_slug, subject_slug])

    if date_from:
        query += " AND e.submitted_at >= %s"
        args.append(date_from)
    if date_to:
        query += " AND e.submitted_at <= %s"
        args.append(date_to)
    if search:
        query += " AND (s.full_name LIKE %s OR s.exam_id LIKE %s)"
        args.extend([f"%{search}%", f"%{search}%"])

    query += " ORDER BY e.submitted_at DESC"
    await cur.execute(query, args)
    results = await cur.fetchall()

    rows = []
    for r in results:
        pct = round((r["total_score"] / r["total_possible"] * 100), 1) if r["total_possible"] else 0
        rows.append({
            "Exam ID": r["exam_id"],
            "Full Name": r["full_name"],
            "Date": str(r["submitted_at"])[:10],
            "Time": str(r["submitted_at"])[11:16],
            "Score": r["total_score"],
            "Total": r["total_possible"],
            "Percentage": f"{pct}%",
            "Grade": calculate_grade(pct),
            "Time Taken (mins)": r["time_taken"]
        })

    df = pd.DataFrame(rows)
    buffer = io.BytesIO()
    df.to_excel(buffer, index=False, sheet_name="Results")
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=results.xlsx"}
    )

#___________________________________________________________________________________________

@app.get("/api/admin/results/export/pdf")
async def export_results_pdf(
    admin=Depends(get_current_admin),
    cur=Depends(db),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    subject_slug: Optional[str] = None
):
    query = """
        SELECT s.exam_id, s.full_name, e.started_at, e.submitted_at,
               e.total_score, e.total_possible,
               TIMEDIFF(e.submitted_at, e.started_at) as time_taken
        FROM exam_sessions e
        JOIN students s ON s.id = e.student_id
        WHERE e.is_submitted = TRUE
            AND (%s IS NULL OR EXISTS (
                SELECT 1 FROM session_subjects ss
                JOIN subjects sub ON sub.id = ss.subject_id
                WHERE ss.session_id = e.id AND sub.slug = %s
            ))
    """
    args = []
    args.extend([subject_slug, subject_slug])

    if date_from:
        query += " AND e.submitted_at >= %s"
        args.append(date_from)
    if date_to:
        query += " AND e.submitted_at <= %s"
        args.append(date_to)
    if search:
        query += " AND (s.full_name LIKE %s OR s.exam_id LIKE %s)"
        args.extend([f"%{search}%", f"%{search}%"])

    query += " ORDER BY e.submitted_at DESC"
    await cur.execute(query, args)
    results = await cur.fetchall()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=2*cm, leftMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    elements = []

    # Header
    elements.append(Paragraph("GlobalTech CBT", ParagraphStyle("title", fontSize=20, fontName="Helvetica-Bold", textColor=colors.HexColor("#1a3a8f"), alignment=1)))
    elements.append(Paragraph("Results & Analytics Report", ParagraphStyle("sub", fontSize=11, textColor=colors.HexColor("#64748b"), alignment=1)))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ParagraphStyle("date", fontSize=9, textColor=colors.HexColor("#94a3b8"), alignment=1)))
    elements.append(Spacer(1, 0.5*cm))

    # Table
    table_data = [["Exam ID", "Full Name", "Date", "Score", "Total", "%", "Grade", "Time(mins)"]]
    for r in results:
        pct = round((r["total_score"] / r["total_possible"] * 100), 1) if r["total_possible"] else 0
        table_data.append([
            r["exam_id"],
            r["full_name"],
            str(r["submitted_at"])[:10],
            str(r["total_score"]),
            str(r["total_possible"]),
            f"{pct}%",
            calculate_grade(pct),
            str(r["time_taken"])
        ])

    table = Table(table_data, colWidths=[3*cm, 4*cm, 2.5*cm, 1.5*cm, 1.5*cm, 1.5*cm, 1.5*cm, 2*cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1a3a8f")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ("PADDING", (0,0), (-1,-1), 5),
    ]))
    elements.append(table)

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=results_report.pdf"}
    )

#________________________________________________________________________________________________

@app.get("/api/admin/dashboard")
async def get_dashboard(admin=Depends(get_current_admin), cur=Depends(db)):
    
    # Total students
    await cur.execute("SELECT COUNT(*) as total FROM students")
    total_students = (await cur.fetchone())["total"]

    # Total exams
    await cur.execute("SELECT COUNT(*) as total FROM exam_sessions")
    total_exams = (await cur.fetchone())["total"]

    # Completed exams
    await cur.execute("SELECT COUNT(*) as total FROM exam_sessions WHERE is_submitted=TRUE")
    completed_exams = (await cur.fetchone())["total"]

    # Total questions
    await cur.execute("SELECT COUNT(*) as total FROM questions")
    total_questions = (await cur.fetchone())["total"]

    # Average score
    await cur.execute("""
        SELECT ROUND(AVG(total_score / total_possible * 100), 1) as avg_score
        FROM exam_sessions
        WHERE is_submitted=TRUE AND total_possible > 0
    """)
    avg_row = await cur.fetchone()
    avg_score = float(avg_row["avg_score"]) if avg_row["avg_score"] else 0

    return {
        "total_students": total_students,
        "total_exams": total_exams,
        "completed_exams": completed_exams,
        "total_questions": total_questions,
        "avg_score": avg_score
    }


@app.get("/api/admin/recent-activity")
async def get_recent_activity(admin=Depends(get_current_admin), cur=Depends(db)):
    await cur.execute("""
        SELECT s.full_name, s.exam_id, e.started_at, e.submitted_at, 
               e.is_submitted, e.total_score, e.total_possible
        FROM exam_sessions e
        JOIN students s ON s.id = e.student_id
        ORDER BY e.started_at DESC
        LIMIT 10
    """)
    rows = await cur.fetchall()
    
    activities = []
    for row in rows:
        if row["is_submitted"]:
            pct = round((row["total_score"] / row["total_possible"] * 100), 1) if row["total_possible"] else 0
            activities.append({
                "type": "submitted",
                "message": f"{row['full_name']} completed an exam — {pct}%",
                "time": str(row["submitted_at"]),
                "exam_id": row["exam_id"]
            })
        else:
            activities.append({
                "type": "started",
                "message": f"{row['full_name']} started an exam",
                "time": str(row["started_at"]),
                "exam_id": row["exam_id"]
            })
    
    return {"activities": activities}


@app.delete("/api/admin/students/{student_id}")
async def delete_student(student_id: int, admin=Depends(get_current_admin), cur=Depends(db)):
    await cur.execute("SELECT id FROM students WHERE id=%s", (student_id,))
    student = await cur.fetchone()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    await cur.execute("DELETE FROM students WHERE id=%s", (student_id,))
    return {"deleted": True, "student_id": student_id}


@app.patch("/api/admin/students/{student_id}/status")
async def update_student_status(student_id: int, body: dict, admin=Depends(get_current_admin), cur=Depends(db)):
    status = body.get("status", "").strip()
    if status not in ["active", "inactive", "suspended"]:
        raise HTTPException(status_code=400, detail="Status must be active, inactive or suspended")

    await cur.execute("SELECT id FROM students WHERE id=%s", (student_id,))
    student = await cur.fetchone()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    await cur.execute("UPDATE students SET status=%s WHERE id=%s", (status, student_id))
    return {"updated": True, "status": status}


@app.post("/api/auth/admin/forgot-password")
async def forgot_password(body: dict, cur=Depends(db)):
    email = body.get("email", "").strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    await cur.execute("SELECT * FROM admins WHERE email=%s", (email,))
    admin = await cur.fetchone()
    if not admin:
        return {"message": "If that email exists, a reset link has been sent."}

    token = secrets.token_hex(32)
    expires = datetime.now() + timedelta(hours=0.15)

    await cur.execute(
        "INSERT INTO password_reset_tokens (admin_id, token, expires_at) VALUES (%s,%s,%s)",
        (admin["id"], token, expires)
    )

    # reset_link = f"http://localhost:3000/reset-password?token={token}"
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

    msg = MIMEMultipart()
    msg["From"] = os.getenv("MAIL_EMAIL")
    msg["To"] = email
    msg["Subject"] = "GlobalTech CBT - Password Reset"
    msg.attach(MIMEText(f"""
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="{reset_link}">Reset Password</a>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, ignore this email.</p>
    """, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname="smtp.gmail.com",
            port=587,
            username=os.getenv("MAIL_EMAIL"),
            password=os.getenv("MAIL_PASSWORD"),
            start_tls=True,
        )
        print("✅ Reset email sent to:", email)
    except Exception as e:
        print("❌ Email error:", e)

    return {"message": "If that email exists, a reset link has been sent."}


@app.post("/api/auth/admin/reset-password")
async def reset_password(body: dict, cur=Depends(db)):
    token = body.get("token", "").strip()
    new_password = body.get("new_password", "").strip()

    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and new password required")

    await cur.execute(
        "SELECT * FROM password_reset_tokens WHERE token=%s AND used=FALSE AND expires_at > NOW()",
        (token,)
    )
    reset = await cur.fetchone()
    if not reset:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    await cur.execute(
        "UPDATE admins SET password=%s WHERE id=%s",
        (hash_password(new_password), reset["admin_id"])
    )
    await cur.execute(
        "UPDATE password_reset_tokens SET used=TRUE WHERE token=%s", (token,)
    )

    return {"message": "Password reset successful"}


@app.patch("/api/admin/subjects/{subject_id}")
async def toggle_subject(subject_id: int, body: dict, admin=Depends(get_current_admin), cur=Depends(db)):
    is_active = body.get("is_active")
    if is_active is None:
        raise HTTPException(status_code=400, detail="is_active required")
    
    await cur.execute("SELECT id FROM subjects WHERE id=%s", (subject_id,))
    subject = await cur.fetchone()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    await cur.execute(
        "UPDATE subjects SET is_active=%s WHERE id=%s",
        (is_active, subject_id)
    )
    return {"updated": True, "is_active": is_active}

@app.delete("/api/admin/subjects/{subject_id}")
async def delete_subject(subject_id: int, admin=Depends(get_current_admin), cur=Depends(db)):
    await cur.execute("SELECT id, is_compulsory FROM subjects WHERE id=%s", (subject_id,))
    subject = await cur.fetchone()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    if subject["is_compulsory"]:
        raise HTTPException(status_code=400, detail="Cannot delete compulsory subject")
    await cur.execute("DELETE FROM subjects WHERE id=%s", (subject_id,))
    return {"deleted": True, "subject_id": subject_id}


@app.get("/api/admin/admins")
async def list_admins(
    search: Optional[str] = None,
    role: Optional[str] = None,
    admin=Depends(get_current_admin),
    cur=Depends(db)
):
    query = """
        SELECT id, username, full_name, email, role, status, created_at
        FROM admins WHERE 1=1
    """
    args = []
    if search:
        query += " AND (full_name LIKE %s OR email LIKE %s)"
        args.extend([f"%{search}%", f"%{search}%"])
    if role and role in ["super_admin", "admin"]:
        query += " AND role=%s"
        args.append(role)
    query += " ORDER BY created_at DESC"
    await cur.execute(query, args)
    rows = await cur.fetchall()

    total = len(rows)
    super_admins = sum(1 for r in rows if r["role"] == "super_admin")
    active = sum(1 for r in rows if r["status"] == "active")

    return {"admins": rows, "stats": {"total": total, "super_admins": super_admins, "active": active}}

#___________________________________________________________________________________________________________________

@app.post("/api/admin/admins", status_code=201)
async def create_admin(body: CreateAdminIn, admin=Depends(get_current_admin), cur=Depends(db)):
    if admin["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can create admins")
    if body.role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=400, detail="Role must be super_admin or admin")

    try:
        await cur.execute(
            "INSERT INTO admins (username, password, full_name, email, role) VALUES (%s,%s,%s,%s,%s)",
            (body.username, hash_password(body.password), body.full_name, body.email, body.role)
        )
    except Exception:
        raise HTTPException(status_code=409, detail="Username already exists")

    # Send welcome email (outside the DB try/except)
    # if body.email:
    #     msg = MIMEMultipart()
    #     msg["From"] = os.getenv("MAIL_EMAIL")
    #     msg["To"] = body.email
    #     msg["Subject"] = "Welcome to GlobalTech CBT — Admin Account Created"
    #     msg.attach(MIMEText(f"""
    #     <h2>Welcome to GlobalTech CBT Admin Portal</h2>
    #     <p>Your admin account has been created. Here are your login credentials:</p>
    #     <p><b>Username:</b> {body.username}</p>
    #     <p><b>Password:</b> {body.password}</p>
    #     <p><b>Role:</b> {body.role}</p>
    #     <p>Login at: <a href="{FRONTEND_URL}">{FRONTEND_URL}</a></p>
    #     <p>Please change your password after first login.</p>
    #     """, "html"))
    #     try:
    #         await aiosmtplib.send(
    #             msg,
    #             hostname="smtp.gmail.com",
    #             port=587,
    #             username=os.getenv("MAIL_EMAIL"),
    #             password=os.getenv("MAIL_PASSWORD"),
    #             start_tls=True,
    #         )
    #     except Exception as e:
    #         print("❌ Welcome email error:", e)

    return {"created": True, "username": body.username}
    
#__________________________________________________________________________________________________________

@app.put("/api/admin/admins/{admin_id}")
async def edit_admin(admin_id: int, body: dict, admin=Depends(get_current_admin), cur=Depends(db)):
    if admin["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can edit admins")
    await cur.execute("SELECT id FROM admins WHERE id=%s", (admin_id,))
    if not await cur.fetchone():
        raise HTTPException(status_code=404, detail="Admin not found")
    full_name = body.get("full_name", "").strip()
    role = body.get("role", "admin")
    await cur.execute(
        "UPDATE admins SET full_name=%s, role=%s WHERE id=%s",
        (full_name, role, admin_id)
    )
    return {"updated": True}


@app.delete("/api/admin/admins/{admin_id}")
async def delete_admin(admin_id: int, admin=Depends(get_current_admin), cur=Depends(db)):
    if admin["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can delete admins")
    if admin["id"] == admin_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    await cur.execute("SELECT id FROM admins WHERE id=%s", (admin_id,))
    if not await cur.fetchone():
        raise HTTPException(status_code=404, detail="Admin not found")
    await cur.execute("DELETE FROM admins WHERE id=%s", (admin_id,))
    return {"deleted": True}


@app.patch("/api/admin/admins/{admin_id}/status")
async def toggle_admin_status(admin_id: int, body: dict, admin=Depends(get_current_admin), cur=Depends(db)):
    if admin["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can change admin status")
    status = body.get("status", "").strip()
    if status not in ["active", "inactive"]:
        raise HTTPException(status_code=400, detail="Status must be active or inactive")
    await cur.execute("UPDATE admins SET status=%s WHERE id=%s", (status, admin_id))
    return {"updated": True, "status": status}


@app.post("/api/admin/admins/{admin_id}/reset-password")
async def reset_admin_password(admin_id: int, body: dict, admin=Depends(get_current_admin), cur=Depends(db)):
    if admin["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admins can reset passwords")
    new_password = body.get("new_password", "").strip()
    if not new_password:
        raise HTTPException(status_code=400, detail="New password required")
    await cur.execute("UPDATE admins SET password=%s WHERE id=%s", (hash_password(new_password), admin_id))
    # Log forced sign out
    await cur.execute(
        "INSERT INTO admin_sessions (admin_id, action) VALUES (%s, %s)",
        (admin_id, "logout")
    )
    return {"reset": True, "signed_out": True}

@app.get("/api/admin/sessions")
async def get_admin_sessions(admin=Depends(get_current_admin), cur=Depends(db)):
    await cur.execute("""
        SELECT a.full_name, a.username, a.role, s.action, s.ip_address, s.device, s.created_at
        FROM admin_sessions s
        JOIN admins a ON a.id = s.admin_id
        ORDER BY s.created_at DESC
        LIMIT 20
    """)
    sessions = await cur.fetchall()

    await cur.execute("""
        SELECT COUNT(DISTINCT admin_id) as online
        FROM admin_sessions s1
        WHERE s1.action='login' 
        AND s1.created_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
        AND NOT EXISTS (
            SELECT 1 FROM admin_sessions s2
            WHERE s2.admin_id = s1.admin_id
            AND s2.action = 'logout'
            AND s2.created_at > s1.created_at
        )
    """)
    online = (await cur.fetchone())["online"]

    await cur.execute("SELECT COUNT(*) as total FROM admin_sessions WHERE action='login'")
    active_sessions = (await cur.fetchone())["total"]

    return {"sessions": sessions, "online_now": online, "active_sessions": active_sessions}

@app.get("/api/admin/subjects")
async def get_all_subjects_admin(admin=Depends(get_current_admin), cur=Depends(db)):
    await cur.execute("""
        SELECT s.id, s.name, s.slug, s.icon, s.total_questions, s.duration_mins, 
               s.is_compulsory, s.is_active, s.created_at,
               COUNT(q.id) as question_count
        FROM subjects s
        LEFT JOIN questions q ON q.subject_id = s.id
        GROUP BY s.id
        ORDER BY s.created_at DESC
    """)
    rows = await cur.fetchall()
    return {"subjects": rows}
