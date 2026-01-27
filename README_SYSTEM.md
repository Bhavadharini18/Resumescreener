# Resume Screening & Skill Matching System

A production-ready AI-powered system for automatically screening multiple resumes and ranking candidates based on job descriptions using NLP and semantic similarity.

##  Project Overview

This system combines modern NLP techniques with explainable AI to:
- Parse and extract text from multiple resume formats (PDF, DOCX)
- Generate semantic embeddings for resumes and job descriptions
- Compute skill matches using a comprehensive skills database
- Produce explainable match scores with detailed breakdowns
- Rank candidates based on a weighted scoring formula

##  Architecture

```
Resume Screening System
├── Backend (FastAPI)
│   ├── app.py              # API endpoints
│   ├── nlp_processor.py    # Embedding & skill extraction
│   ├── resume_parser.py    # PDF/DOCX parsing
│   ├── skill_matcher.py    # Scoring logic
│   ├── skills_database.py  # Predefined skills
│   ├── config.py           # Configuration
│   └── utils.py            # Helper functions
│
└── Frontend (Streamlit)
    └── streamlit_app.py    # Interactive UI
```

##  Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend API** | FastAPI | RESTful API server |
| **NLP Models** | Sentence Transformers | Text embeddings |
| **NER & Tokenization** | SpaCy | Named entity recognition |
| **Similarity** | scikit-learn | Cosine similarity computation |
| **Resume Parsing** | pdfplumber, python-docx | Extract text from files |
| **Frontend Demo** | Streamlit | Interactive web interface |
| **Server** | Uvicorn | ASGI server |

##  Scoring Logic

**Final Score Formula:**
```
Final Score = 0.7 × Semantic Similarity + 0.3 × Skill Match Score
```

### Components:
1. **Semantic Similarity (70%)**
   - Cosine similarity between resume and job description embeddings
   - Uses all-MiniLM-L6-v2 model for fast, lightweight embeddings
   - Captures overall content relevance

2. **Skill Match Score (30%)**
   - Percentage of required skills found in resume
   - Extracted using pattern matching against skills database
   - Explainable: shows matched, missing, and additional skills

##  Quick Start

### Prerequisites
- Python 3.8+
- pip or conda

### Installation

1. **Clone and navigate to project:**
```bash
cd "resume shortlister"
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Download SpaCy model** (one-time setup):
```bash
python -m spacy download en_core_web_sm
```

### Running the System

#### Option 1: Run Backend API + Streamlit UI (Recommended for Demo)

**Terminal 1 - Start Backend API:**
```bash
cd backend_py
python app.py
```

The API will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

**Terminal 2 - Start Streamlit App:**
```bash
streamlit run streamlit_app.py
```

The UI will open at: `http://localhost:8501`

#### Option 2: Backend API Only

```bash
cd backend_py
python app.py
```

Then use the API endpoints directly via curl or Postman.

##  API Endpoints

### 1. Screen Multiple Resumes
**POST** `/api/screen-resumes`

Upload multiple resumes and a job description to get ranked candidates.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/screen-resumes" \
  -F "resumes=@resume1.pdf" \
  -F "resumes=@resume2.docx" \
  -F "job_description=Python developer with 5+ years experience..."
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "total_candidates": 2,
      "average_score": 0.75,
      "top_candidate": "John Doe"
    },
    "ranked_candidates": [
      {
        "candidate_name": "John Doe",
        "rank": 1,
        "final_score": 0.82,
        "final_score_percentage": 82.0,
        "semantic_similarity": 0.85,
        "skill_match": {
          "score": 0.75,
          "percentage": 75.0,
          "matched_skills": ["python", "django", "postgresql"],
          "missing_skills": ["kubernetes", "aws"],
          "matched_count": 3,
          "required_count": 4
        }
      }
    ]
  }
}
```

### 2. Score Single Resume
**POST** `/api/score-single`

Score a single resume against a job description.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/score-single" \
  -F "resume=@resume.pdf" \
  -F "job_description=Senior Backend Engineer..."
```

### 3. Extract Skills from Job Description
**GET** `/api/extract-skills`

Extract required skills from a job description.

**Request:**
```bash
curl "http://localhost:8000/api/extract-skills?job_description=Looking%20for%20Python%20and%20React%20developer"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "skills": ["python", "react", "javascript"],
    "skill_count": 3,
    "details": {
      "python": {"aliases_matched": ["python", "py"]},
      "react": {"aliases_matched": ["react"]}
    }
  }
}
```

### 4. Health Check
**GET** `/health`

Check if API is running.

## Usage Examples

### Example 1: Batch Screening with Streamlit UI

1. Start both Backend API and Streamlit
2. Open Streamlit UI (http://localhost:8501)
3. Go to "Batch Screening" tab
4. Paste job description
5. Upload multiple resume files
6. Click "Screen Resumes"
7. View ranked results with explanations
8. Download results as CSV or JSON

### Example 2: Programmatic API Usage

```python
import requests
import json

# Endpoint
url = "http://localhost:8000/api/screen-resumes"

# Prepare job description
job_desc = """
Senior Python Developer
- 5+ years Python experience
- Django and FastAPI
- PostgreSQL and Redis
- AWS deployment experience
- Docker and Kubernetes
"""

# Upload multiple resumes
files = [
    ("resumes", open("resume1.pdf", "rb")),
    ("resumes", open("resume2.docx", "rb")),
]
data = {"job_description": job_desc}

# Make request
response = requests.post(url, files=files, data=data)
results = response.json()

# Process results
print(f"Total candidates: {results['data']['summary']['total_candidates']}")
for candidate in results['data']['ranked_candidates']:
    print(f"\nRank {candidate['rank']}: {candidate['candidate_name']}")
    print(f"  Score: {candidate['final_score_percentage']:.2f}%")
    print(f"  Matched Skills: {', '.join(candidate['skill_match']['matched_skills'])}")
    print(f"  Missing Skills: {', '.join(candidate['skill_match']['missing_skills'])}")
```

##  Skills Database

The system includes 70+ predefined technical and soft skills:

### Technical Skills
- **Programming:** Python, JavaScript, Java, C++, Go, Rust, Ruby, PHP
- **Web:** React, Angular, Vue, HTML/CSS, TypeScript, Node.js, Express, Django, FastAPI
- **Databases:** SQL, MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, DynamoDB
- **Cloud/DevOps:** AWS, Azure, GCP, Docker, Kubernetes, CI/CD, Terraform, Ansible
- **AI/ML:** Machine Learning, Deep Learning, NLP, TensorFlow, PyTorch, Scikit-learn
- **Other:** Git, REST API, GraphQL, Microservices, Agile, Linux

### Soft Skills
- Communication, Leadership, Teamwork, Problem Solving
- Project Management, Critical Thinking, Time Management, Adaptability

Easily extend by editing `backend_py/skills_database.py`

##  Configuration

Edit `backend_py/config.py` to customize:

```python
# Model & Performance
MODEL_NAME = "all-MiniLM-L6-v2"  # Sentence transformer model
SPACY_MODEL = "en_core_web_sm"   # SpaCy NER model

# Scoring Weights
SEMANTIC_WEIGHT = 0.7   # Weight for semantic similarity
SKILL_WEIGHT = 0.3      # Weight for skill matching

# Thresholds
SKILL_MATCH_THRESHOLD = 0.85
MAX_FILE_SIZE = 10 * 1024 * 1024

# API Settings
API_HOST = "0.0.0.0"
API_PORT = 8000
```

##  Testing

### Test with Sample Files

1. Create sample resume files
2. Use Streamlit UI or API to process them
3. Verify scoring and ranking logic

### Unit Testing (Future Enhancement)

```bash
pytest tests/ -v
```

## Privacy & Ethics

**Bias Mitigation:**
-  Text-based matching only (no name, gender, age processing)
-  Skill-focused evaluation
-  Explainable scoring
-  No demographic inference

**Data Handling:**
- No data persistence by default
- Files processed in-memory only
- GDPR-ready with no storage

##  Performance Characteristics

| Metric | Value |
|--------|-------|
| Model Size | ~23 MB (all-MiniLM-L6-v2) |
| Embedding Generation | ~100ms per document |
| Single Resume Scoring | ~200-500ms |
| Batch Scoring (10 resumes) | ~2-3 seconds |
| Memory Usage | ~1 GB (with models loaded) |

##  Production Deployment

### Docker (Coming Soon)

```bash
docker build -t resume-screener .
docker run -p 8000:8000 resume-screener
```

### Cloud Deployment

- **Azure Container Instances** (ACI)
- **AWS Elastic Container Service** (ECS)
- **Google Cloud Run**
- **Heroku**

### Scaling Considerations

1. **Model Caching:** Models are loaded once at startup
2. **Batch Processing:** API supports up to 50 resumes per request
3. **Async Operations:** FastAPI handles concurrent requests
4. **Load Balancing:** Deploy multiple API instances behind a load balancer


## File Structure

```
resume shortlister/
├── requirements.txt              # Python dependencies
├── streamlit_app.py              # Streamlit UI
├── README.md                     # This file
│
└── backend_py/
    ├── __init__.py               # Package initialization
    ├── app.py                    # FastAPI application
    ├── config.py                 # Configuration
    ├── nlp_processor.py          # NLP processing
    ├── resume_parser.py          # Resume parsing
    ├── skill_matcher.py          # Scoring logic
    ├── skills_database.py        # Skills database
    └── utils.py                  # Utilities
```

##  Troubleshooting

### "Cannot connect to API"
- Ensure backend is running: `python backend_py/app.py`
- Check port 8000 is available: `netstat -ano | findstr :8000`

### "SpaCy model not found"
```bash
python -m spacy download en_core_web_sm
```

### "Out of memory"
- Process smaller batches
- Use GPU acceleration (future enhancement)
- Reduce model size (already using lightweight model)

### "Resume parsing error"
- Ensure PDF/DOCX files are valid
- Check file size < 10MB
- Try re-saving PDF/DOCX file

## References

- [Sentence Transformers](https://www.sbert.net/)
- [SpaCy Documentation](https://spacy.io/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Streamlit](https://streamlit.io/)
- [scikit-learn](https://scikit-learn.org/)

