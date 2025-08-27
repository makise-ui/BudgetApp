import os
import re
import uuid
import json
from typing import Optional, Dict, Any, List

import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DEFAULT_BASES = [
    "https://student.kalasalingam.ac.in",
    "https://sis.kalasalingam.ac.in",
]

class Credentials(BaseModel):
    username: str
    password: str

class SISClient:
    def __init__(self, bases: Optional[List[str]] = None) -> None:
        self.s = requests.Session()
        self.s.headers.update({
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
        })
        self.bases = bases or DEFAULT_BASES
        self.base: Optional[str] = None

    def _get_csrf(self, base: str) -> str:
        r = self.s.get(f"{base}/login", timeout=30)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        token_el = soup.select_one('input[name="_token"]')
        token = token_el.get('value') if token_el else None
        if not token:
            raise RuntimeError("Unable to find csrf token")
        self.s.headers.update({"Referer": f"{base}/login"})
        return token

    def login(self, username: str, password: str) -> None:
        last_error: Optional[Exception] = None
        for base in self.bases:
            try:
                token = self._get_csrf(base)
                payload = {"_token": token, "register_no": username, "password": password, "remember": "1"}
                r = self.s.post(f"{base}/login", data=payload, allow_redirects=True, timeout=30)
                if r.status_code != 200:
                    last_error = HTTPException(status_code=502, detail="Login failed: bad status")
                    continue
                # Some responses redirect to '/' where Logout appears
                text = r.text
                if "Logout" not in text:
                    d = self.s.get(f"{base}/", timeout=30)
                    text = d.text
                if "Logout" in text:
                    self.base = base
                    return
                else:
                    last_error = HTTPException(status_code=401, detail="Invalid credentials")
            except Exception as e:
                last_error = e
                continue
        if isinstance(last_error, HTTPException):
            raise last_error
        raise HTTPException(status_code=500, detail=f"Login failed: {last_error}")

    def _require_base(self) -> str:
        if not self.base:
            raise HTTPException(status_code=400, detail="Client not authenticated")
        return self.base

    def profile(self) -> Dict[str, Any]:
        base = self._require_base()
        html = self.s.get(f"{base}/", timeout=30).text
        soup = BeautifulSoup(html, "html.parser")
        profile: Dict[str, Any] = {}
        for h in soup.find_all(["h2", "h3", "h4", "h5"]):
            if "Personal Details" in h.get_text():
                table = h.find_next("table")
                if table:
                    for row in table.select("tr"):
                        cells = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
                        if len(cells) == 2:
                            k, v = cells
                            profile[k] = v
        normalized = {
            "register_no": profile.get("Register Number"),
            "name": profile.get("Name of the Student"),
            "degree_programme": profile.get("Degree / Programme"),
            "batch": profile.get("Batch"),
            "section": profile.get("Section"),
            "faculty_advisor": profile.get("Faculty Advisor"),
            "dob": profile.get("Date of birth"),
            "gender": profile.get("Gender"),
            "address": profile.get("Address"),
        }
        return {"profile": normalized, "raw": profile}

    def attendance_summary(self) -> List[Dict[str, Any]]:
        base = self._require_base()
        j = self.s.get(f"{base}/attendance-details", timeout=30).json()
        return j.get("data", [])

    def attendance_details_for_assign(self, assign_id: str) -> List[Dict[str, Any]]:
        base = self._require_base()
        j = self.s.get(f"{base}/attendance-details/{assign_id}", timeout=30).json()
        return j.get("data", [])

    def attendance_full(self) -> Dict[str, Any]:
        summary = self.attendance_summary()
        details_map: Dict[str, Any] = {}
        for row in summary:
            aid = row.get("assign_id") or row.get("id")
            if not aid and row.get("details_url"):
                m = re.search(r"/attendance-details/(\d+)", row["details_url"]) 
                if m:
                    aid = m.group(1)
            if not aid:
                continue
            details = self.attendance_details_for_assign(str(aid))
            details_map[str(aid)] = {
                "course_code": row.get("course_code"),
                "course_name": row.get("course_name"),
                "summary": row,
                "sessions": details,
            }
        return {"summary": summary, "courses": details_map}

    def marks(self) -> Dict[str, Any]:
        base = self._require_base()
        listing = self.s.get(f"{base}/mark-details", timeout=30).json()
        courses = []
        for row in listing.get("data", []):
            url = row.get("details_url")
            details = []
            if url:
                try:
                    j = self.s.get(url, timeout=30).json()
                    details = j.get("data", [])
                except Exception:
                    details = []
            courses.append({"summary": row, "details": details})
        return {"courses": courses}

# In-memory simple token store (not for production)
TOKENS: Dict[str, SISClient] = {}

app = FastAPI(title="KARE SIS API Wrapper", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_client(authorization: Optional[str] = Header(default=None)) -> SISClient:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.replace("Bearer ", "").strip()
    client = TOKENS.get(token)
    if not client:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return client

@app.post("/auth/login")
def auth_login(creds: Credentials) -> Dict[str, Any]:
    client = SISClient()
    try:
        client.login(creds.username, creds.password)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {e}")
    token = uuid.uuid4().hex
    TOKENS[token] = client
    return {"token": token}

@app.get("/profile")
def get_profile(client: SISClient = Depends(get_client)) -> Dict[str, Any]:
    return client.profile()

@app.get("/attendance/summary")
def get_attendance_summary(client: SISClient = Depends(get_client)) -> Dict[str, Any]:
    return {"data": client.attendance_summary()}

@app.get("/attendance/details")
def get_attendance_details(client: SISClient = Depends(get_client)) -> Dict[str, Any]:
    return client.attendance_full()

@app.get("/marks")
def get_marks(client: SISClient = Depends(get_client)) -> Dict[str, Any]:
    return client.marks()

@app.get("/all")
def get_all(client: SISClient = Depends(get_client)) -> Dict[str, Any]:
    profile = client.profile()
    attendance = client.attendance_full()
    marks = client.marks()
    return {"profile": profile["profile"], "attendance": attendance, "marks": marks}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "12000"))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
