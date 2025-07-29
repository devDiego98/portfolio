from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
import os
from datetime import datetime
import uuid

# Initialize FastAPI app
app = FastAPI(title="Diego Perez Portfolio API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client.portfolio_db
contacts_collection = db.contacts

# Pydantic models
class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    phone: str = None

class ProjectData(BaseModel):
    id: str
    title: str
    description: str
    technologies: list
    github_url: str = None
    live_url: str = None
    image_url: str = None

@app.get("/")
async def root():
    return {"message": "Diego Perez Portfolio API", "status": "active"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/contact")
async def submit_contact(contact: ContactMessage):
    try:
        # Create contact document
        contact_doc = {
            "id": str(uuid.uuid4()),
            "name": contact.name,
            "email": contact.email,
            "subject": contact.subject,
            "message": contact.message,
            "phone": contact.phone,
            "timestamp": datetime.now().isoformat(),
            "status": "new"
        }

        # Insert into MongoDB
        result = contacts_collection.insert_one(contact_doc)

        if result.inserted_id:
            return {
                "success": True,
                "message": "Contact message received successfully!",
                "contact_id": contact_doc["id"]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save contact message")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.get("/api/projects")
async def get_projects():
    """Get portfolio projects data"""
    projects = [
        {
            "id": "1",
            "title": "Analytics Dashboard",
            "description": "Advanced analytics dashboard built with Svelte featuring real-time data visualization, interactive charts, and responsive design for comprehensive business intelligence.",
            "technologies": ["Svelte", "D3.js", "Chart.js", "WebSocket", "PostgreSQL"],
            "github_url": "https://github.com/devDiego1/svelte-dashboard",
            "live_url": "https://analytics-dashboard.netlify.app",
            "category": "Web Application"
        },
        {
            "id": "2",
            "title": "TruckAtlas",
            "description": "Comprehensive trucking and logistics platform providing route optimization, fleet management, and real-time tracking solutions for the transportation industry.",
            "technologies": ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Google Maps API"],
            "github_url": None,
            "live_url": "https://www.truckatlas.com/",
            "category": "Web Application"
        },
        {
            "id": "3",
            "title": "Wuru.ai",
            "description": "AI-powered platform leveraging machine learning and natural language processing to deliver intelligent automation and data insights for modern businesses.",
            "technologies": ["React", "Python", "TensorFlow", "FastAPI", "MongoDB", "Docker"],
            "github_url": None,
            "live_url": "https://www.wuru.ai/",
            "category": "Landing Pages"
        }
    ]

    return {"projects": projects}

@app.get("/api/skills")
async def get_skills():
    """Get skills and technologies data"""
    skills = {
        "frontend": [
            {"name": "React", "level": 95, "years": 7},
            {"name": "JavaScript", "level": 98, "years": 7},
            {"name": "TypeScript", "level": 90, "years": 5},
            {"name": "Next.js", "level": 92, "years": 4},
            {"name": "Svelte", "level": 85, "years": 3},
            {"name": "HTML/CSS", "level": 96, "years": 7},
            {"name": "Tailwind CSS", "level": 88, "years": 3}
        ],
        "tools": [
            {"name": "Git", "level": 90, "years": 7},
            {"name": "Vite", "level": 80, "years": 2},
            {"name": "Docker", "level": 75, "years": 3},
        ],
        "mobile": [
            {"name": "React Native", "level": 80, "years": 3},
            {"name": "Flutter", "level": 65, "years": 2}
        ]
    }

    return {"skills": skills}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)