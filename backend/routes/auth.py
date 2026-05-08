from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db import get_connection
import hashlib

router = APIRouter()

# ---------------- SCHEMAS ----------------
class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


# ---------------- PASSWORD HELPERS ----------------
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(input_password: str, stored_password: str) -> bool:
    return hashlib.sha256(input_password.encode()).hexdigest() == stored_password


# ---------------- SIGNUP ----------------
@router.post("/signup")
def signup(user: UserSignup):
    conn = get_connection()
    cursor = conn.cursor()

    # Check if user already exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)

    cursor.execute("""
        INSERT INTO users (name, email, password)
        VALUES (%s, %s, %s)
        RETURNING id
    """, (user.name, user.email, hashed_password))

    user_id = cursor.fetchone()[0]
    conn.commit()

    return {"message": "User created successfully", "user_id": user_id}


# ---------------- LOGIN ----------------
@router.post("/login")
def login(user: UserLogin):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, password FROM users WHERE email = %s
    """, (user.email,))

    result = cursor.fetchone()

    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id, stored_password = result

    if not verify_password(user.password, stored_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"message": "Login successful", "user_id": user_id}