"""
Resume Screening & Skill Matching System - Project Index
==========================================================

This file provides a comprehensive index of all project files, their purposes,
and how they work together to create the Resume Screening System.
"""

PROJECT_STRUCTURE = """
resume shortlister/
│
├── 📋 DOCUMENTATION & GUIDES
│   ├── README_SYSTEM.md          - Complete system documentation (START HERE)
│   ├── QUICKSTART.py             - Quick start guide with examples
│   ├── TESTING_GUIDE.py          - Validation and testing procedures
│   ├── DELIVERABLES.py           - Project deliverables checklist
│   ├── INDEX.py                  - This file
│   └── requirements.txt           - Python dependencies
│
├── 🎨 FRONTEND (Streamlit)
│   └── streamlit_app.py          - Interactive web UI
│       ├── Batch Resume Screening tab
│       ├── Single Resume tab
│       └── Extract Skills tab
│
├── 🔧 BACKEND (Python/FastAPI)
│   └── backend_py/
│       ├── __init__.py           - Package initialization
│       ├── app.py                - FastAPI application & endpoints
│       ├── config.py             - Configuration & constants
│       ├── nlp_processor.py       - NLP & embedding generation
│       ├── resume_parser.py       - PDF/DOCX parsing
│       ├── skill_matcher.py       - Scoring & ranking logic
│       ├── skills_database.py     - 70+ predefined skills
│       └── utils.py              - Utility functions
│
└── 📊 SAMPLE DATA & TESTING
    ├── sample_data.py            - Sample resumes and job descriptions
    └── TESTING_GUIDE.py          - Validation procedures
"""

FILE_DESCRIPTIONS = {
    "README_SYSTEM.md": {
        "purpose": "Complete system documentation",
        "start_here": True,
        "sections": [
            "Project overview",
            "Architecture diagram",
            "Tech stack",
            "Scoring logic",
            "Installation guide",
            "API endpoints",
            "Usage examples",
            "Skills database",
            "Configuration",
            "Troubleshooting"
        ],
        "read_time": "15-20 minutes"
    },
    
    "QUICKSTART.py": {
        "purpose": "Quick start guide and API usage examples",
        "type": "Python file with docstrings",
        "contains": [
            "Step-by-step installation instructions",
            "Backend startup commands",
            "Frontend startup commands",
            "API usage examples",
            "Scoring logic explanation"
        ]
    },
    
    "TESTING_GUIDE.py": {
        "purpose": "Validation and testing framework",
        "type": "Executable Python script",
        "test_functions": [
            "validate_imports() - Check all packages installed",
            "validate_backend_structure() - Verify backend files",
            "validate_frontend_structure() - Verify frontend file",
            "validate_configuration() - Check config values",
            "validate_skills_database() - Verify skills loaded",
            "test_resume_parser() - Test parsing logic",
            "test_skill_matcher() - Test scoring logic"
        ],
        "run": "python TESTING_GUIDE.py"
    },
    
    "requirements.txt": {
        "purpose": "Python package dependencies",
        "total_packages": 13,
        "key_packages": [
            "fastapi - Web framework",
            "sentence-transformers - Embeddings",
            "spacy - NLP",
            "pdfplumber - PDF parsing",
            "python-docx - DOCX parsing",
            "streamlit - UI",
            "scikit-learn - Similarity metrics"
        ],
        "install": "pip install -r requirements.txt"
    },
    
    "streamlit_app.py": {
        "purpose": "Interactive web UI for resume screening",
        "type": "Streamlit application",
        "tabs": [
            {
                "name": "Batch Screening",
                "features": [
                    "Upload multiple resumes (PDF/DOCX)",
                    "Enter job description",
                    "Screen resumes",
                    "View ranked results",
                    "Download results (CSV/JSON)"
                ]
            },
            {
                "name": "Single Resume",
                "features": [
                    "Upload one resume",
                    "Enter job description",
                    "Get detailed score",
                    "Skills analysis"
                ]
            },
            {
                "name": "Extract Skills",
                "features": [
                    "Paste job description",
                    "Extract required skills",
                    "View skill aliases"
                ]
            }
        ],
        "run": "streamlit run streamlit_app.py"
    },
    
    "backend_py/app.py": {
        "purpose": "FastAPI backend application",
        "type": "REST API server",
        "endpoints": [
            {
                "method": "POST",
                "path": "/api/screen-resumes",
                "description": "Screen multiple resumes",
                "returns": "Ranked candidates with scores"
            },
            {
                "method": "POST",
                "path": "/api/score-single",
                "description": "Score single resume",
                "returns": "Detailed score for one candidate"
            },
            {
                "method": "GET",
                "path": "/api/extract-skills",
                "description": "Extract skills from job description",
                "returns": "List of required skills"
            },
            {
                "method": "GET",
                "path": "/health",
                "description": "Health check",
                "returns": "API status"
            }
        ],
        "run": "python -m backend_py.app"
    },
    
    "backend_py/nlp_processor.py": {
        "purpose": "NLP processing engine",
        "main_class": "NLPProcessor",
        "dependencies": [
            "Sentence Transformers (all-MiniLM-L6-v2)",
            "SpaCy (en_core_web_sm)"
        ],
        "key_methods": [
            "get_embeddings() - Generate text embeddings",
            "extract_skills() - Extract skills from text",
            "extract_key_phrases() - Extract named entities",
            "process_resume() - Complete resume processing",
            "process_job_description() - Complete job processing"
        ]
    },
    
    "backend_py/resume_parser.py": {
        "purpose": "Resume file parsing",
        "supported_formats": [".pdf", ".docx"],
        "functions": [
            "extract_text_from_pdf() - Parse PDF files",
            "extract_text_from_docx() - Parse DOCX files",
            "extract_text_from_resume() - Unified interface",
            "clean_resume_text() - Text normalization"
        ],
        "dependencies": [
            "pdfplumber - PDF parsing",
            "python-docx - DOCX parsing"
        ]
    },
    
    "backend_py/skill_matcher.py": {
        "purpose": "Scoring and ranking engine",
        "main_classes": [
            {
                "name": "SkillMatcher",
                "methods": [
                    "compute_skill_match_score()",
                    "compute_semantic_similarity()",
                    "compute_final_score()",
                    "rank_candidates()"
                ]
            },
            {
                "name": "CandidateScorer",
                "methods": [
                    "score_candidate()",
                    "score_batch()"
                ]
            }
        ],
        "scoring_formula": "0.7 × Semantic Similarity + 0.3 × Skill Match"
    },
    
    "backend_py/skills_database.py": {
        "purpose": "Skill definitions and aliases",
        "total_skills": 70,
        "categories": {
            "technical": [
                "Programming Languages (8)",
                "Web Technologies (13)",
                "Databases (8)",
                "Cloud & DevOps (9)",
                "AI/ML (8)",
                "Other (6)"
            ],
            "soft": [
                "Communication, Leadership, Teamwork",
                "Problem Solving, Project Management"
            ]
        },
        "format": "Dictionary mapping skill names to aliases"
    },
    
    "backend_py/config.py": {
        "purpose": "Configuration and constants",
        "settings": [
            "MODEL_NAME - Sentence Transformer model",
            "SPACY_MODEL - SpaCy NER model",
            "SEMANTIC_WEIGHT - Weight for semantic similarity",
            "SKILL_WEIGHT - Weight for skill matching",
            "MAX_FILE_SIZE - Maximum resume file size",
            "ALLOWED_EXTENSIONS - Allowed file types"
        ]
    },
    
    "backend_py/utils.py": {
        "purpose": "Utility functions",
        "functions": [
            "format_score_report() - Format API responses",
            "generate_summary_report() - Summary statistics",
            "validate_file_extension() - File validation",
            "sanitize_filename() - Extract candidate names",
            "create_error_response() - Standardized errors",
            "create_success_response() - Standardized responses"
        ]
    },
    
    "sample_data.py": {
        "purpose": "Sample data for testing",
        "contents": [
            "Sample job descriptions",
            "Sample resumes",
            "Evaluation scenarios"
        ],
        "use_cases": [
            "Testing the scoring logic",
            "Understanding how the system works",
            "API testing without real files"
        ]
    }
}

GETTING_STARTED = """
╔════════════════════════════════════════════════════════════╗
║             GETTING STARTED (5 MINUTES)                   ║
╚════════════════════════════════════════════════════════════╝

STEP 1: Install Dependencies
──────────────────────────────
pip install -r requirements.txt

STEP 2: Download SpaCy Model
──────────────────────────────
python -m spacy download en_core_web_sm

STEP 3: Start Backend API (Terminal 1)
───────────────────────────────────────
python -m backend_py.app

✓ API available at: http://localhost:8000
✓ Documentation at: http://localhost:8000/docs

STEP 4: Start Streamlit UI (Terminal 2)
──────────────────────────────────────────
streamlit run streamlit_app.py

✓ UI available at: http://localhost:8501

STEP 5: Use the System
──────────────────────
1. Upload resume files (PDF or DOCX)
2. Enter job description
3. Click "Screen Resumes"
4. View ranked results with explanations
5. Download results (CSV or JSON)

✅ YOU'RE DONE!
"""

SYSTEM_FLOW = """
╔════════════════════════════════════════════════════════════╗
║           SYSTEM EXECUTION FLOW                           ║
╚════════════════════════════════════════════════════════════╝

USER UPLOADS FILES
        │
        ▼
   Streamlit UI
   ├─ Validates files
   ├─ Reads file content
   └─ Sends to API
        │
        ▼
   FastAPI Backend
   ├─ Receives files and job description
   ├─ Validates inputs
   └─ Routes to /api/screen-resumes
        │
        ▼
   Resume Parser
   ├─ Extracts text from PDF/DOCX
   ├─ Cleans text
   └─ Returns text to processor
        │
        ▼
   NLP Processor
   ├─ Generates embeddings (Sentence Transformers)
   ├─ Extracts skills (SpaCy + pattern matching)
   ├─ Extracts entities (SpaCy NER)
   └─ Returns processed data
        │
        ▼
   Skill Matcher
   ├─ Computes semantic similarity
   ├─ Computes skill match percentage
   ├─ Calculates final score
   └─ Ranks candidates
        │
        ▼
   Format & Return Results
   ├─ Format scores
   ├─ Generate explanations
   └─ Return to UI
        │
        ▼
   Display Results
   ├─ Show ranked candidates
   ├─ Display matched/missing skills
   ├─ Show explanations
   └─ Offer download options

Score Formula:
    Final Score = 0.7 × Semantic Similarity + 0.3 × Skill Match
"""

QUICK_REFERENCE = """
╔════════════════════════════════════════════════════════════╗
║              QUICK REFERENCE GUIDE                        ║
╚════════════════════════════════════════════════════════════╝

API ENDPOINTS
─────────────
POST   /api/screen-resumes   - Batch screening
POST   /api/score-single     - Single resume scoring  
GET    /api/extract-skills   - Skill extraction
GET    /health               - Health check

KEY FILES TO UNDERSTAND
───────────────────────
1. backend_py/app.py          - Start here: main API
2. backend_py/nlp_processor.py - Embedding & skill extraction
3. backend_py/skill_matcher.py - Scoring logic
4. streamlit_app.py            - User interface

CONFIGURATION
──────────────
Edit backend_py/config.py to customize:
• Model selection
• Scoring weights (currently 0.7/0.3)
• File size limits
• API host/port

ADDING SKILLS
──────────────
Edit backend_py/skills_database.py to add:
• New skill categories
• Skill aliases
• Soft skills

TROUBLESHOOTING
────────────────
Issue: "Cannot connect to API"
→ Ensure backend is running: python -m backend_py.app

Issue: "SpaCy model not found"
→ Download: python -m spacy download en_core_web_sm

Issue: "No module named fastapi"
→ Install requirements: pip install -r requirements.txt

PERFORMANCE TIPS
─────────────────
• Batch up to 50 resumes per request
• Use lightweight model (already configured)
• Run on SSD for faster file I/O
• Use GPU for faster embeddings (future enhancement)

DEPLOYMENT
───────────
Production Deployment:
• Use uvicorn with multiple workers
• Set up load balancer
• Use environment variables for configuration
• Add rate limiting
• Enable HTTPS
"""

def print_index():
    """Print the project index."""
    
    print("""
╔════════════════════════════════════════════════════════════════╗
║   RESUME SCREENING & SKILL MATCHING SYSTEM - PROJECT INDEX    ║
╚════════════════════════════════════════════════════════════════╝
    """)
    
    print(PROJECT_STRUCTURE)
    
    print(GETTING_STARTED)
    print(SYSTEM_FLOW)
    print(QUICK_REFERENCE)
    
    print("""
╔════════════════════════════════════════════════════════════════╗
║                 DETAILED FILE REFERENCE                       ║
╚════════════════════════════════════════════════════════════════╝
    """)
    
    for filename, details in FILE_DESCRIPTIONS.items():
        print(f"\n📄 {filename}")
        print(f"{'─'*60}")
        for key, value in details.items():
            if key == "purpose":
                print(f"   Purpose: {value}")
            elif key == "start_here":
                if value:
                    print(f"   ⭐ START HERE!")
            elif isinstance(value, list):
                print(f"   {key.replace('_', ' ').title()}:")
                for item in value:
                    if isinstance(item, dict):
                        for sub_k, sub_v in item.items():
                            print(f"      • {sub_k}: {sub_v}")
                    else:
                        print(f"      • {item}")
            elif isinstance(value, dict):
                print(f"   {key.replace('_', ' ').title()}:")
                for k, v in value.items():
                    print(f"      • {k}: {v}")
            else:
                if key not in ["type", "start_here"]:
                    print(f"   {key.replace('_', ' ').title()}: {value}")

if __name__ == "__main__":
    print_index()
    
    print("""

╔════════════════════════════════════════════════════════════════╗
║                      NEXT STEPS                               ║
╚════════════════════════════════════════════════════════════════╝

1. Read README_SYSTEM.md for complete documentation
2. Run TESTING_GUIDE.py to validate installation
3. Follow QUICKSTART.py for first run
4. Check sample_data.py for test data
5. Start the system and begin screening resumes!

Questions? Check README_SYSTEM.md or TESTING_GUIDE.py

Happy Resume Screening! 🎉
    """)
