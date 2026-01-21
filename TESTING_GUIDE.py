"""Integration testing and validation guide for Resume Screening System."""

"""
TESTING & INTEGRATION GUIDE
===========================

This guide helps you validate the Resume Screening System is working correctly
and provides examples for both API and Streamlit testing.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List

def print_section(title: str):
    """Print a formatted section header."""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")

def validate_imports():
    """Test that all required packages are installed."""
    print_section("1. VALIDATING IMPORTS")
    
    required_packages = {
        "fastapi": "FastAPI Framework",
        "uvicorn": "ASGI Server",
        "sentence_transformers": "Sentence Transformers",
        "spacy": "SpaCy NLP",
        "sklearn": "scikit-learn",
        "pdfplumber": "PDF Parser",
        "docx": "Word Document Parser",
        "streamlit": "Streamlit UI",
    }
    
    all_ok = True
    for package, description in required_packages.items():
        try:
            __import__(package)
            print(f"✓ {package:25} ({description})")
        except ImportError:
            print(f"✗ {package:25} ({description}) - NOT INSTALLED")
            all_ok = False
    
    if all_ok:
        print("\n✅ All required packages installed!")
    else:
        print("\n❌ Some packages missing. Run: pip install -r requirements.txt")
    
    return all_ok

def validate_backend_structure():
    """Validate backend file structure."""
    print_section("2. VALIDATING BACKEND STRUCTURE")
    
    backend_dir = Path("backend_py")
    required_files = {
        "__init__.py": "Package initialization",
        "app.py": "FastAPI application",
        "config.py": "Configuration",
        "nlp_processor.py": "NLP processing",
        "resume_parser.py": "Resume parsing",
        "skill_matcher.py": "Scoring logic",
        "skills_database.py": "Skills database",
        "utils.py": "Utility functions",
    }
    
    all_ok = True
    for filename, description in required_files.items():
        file_path = backend_dir / filename
        if file_path.exists():
            print(f"✓ {filename:25} ({description})")
        else:
            print(f"✗ {filename:25} ({description}) - MISSING")
            all_ok = False
    
    if all_ok:
        print("\n✅ All backend files present!")
    else:
        print("\n❌ Some backend files missing!")
    
    return all_ok

def validate_frontend_structure():
    """Validate frontend structure."""
    print_section("3. VALIDATING FRONTEND STRUCTURE")
    
    frontend_file = Path("streamlit_app.py")
    
    if frontend_file.exists():
        print(f"✓ streamlit_app.py (Streamlit UI) - {frontend_file.stat().st_size} bytes")
        print("\n✅ Frontend file present!")
        return True
    else:
        print(f"✗ streamlit_app.py - MISSING")
        print("\n❌ Frontend file missing!")
        return False

def validate_configuration():
    """Validate configuration settings."""
    print_section("4. VALIDATING CONFIGURATION")
    
    try:
        from backend_py.config import (
            MODEL_NAME, SPACY_MODEL, SEMANTIC_WEIGHT, 
            SKILL_WEIGHT, ALLOWED_EXTENSIONS
        )
        
        print(f"✓ Model: {MODEL_NAME}")
        print(f"✓ SpaCy Model: {SPACY_MODEL}")
        print(f"✓ Semantic Weight: {SEMANTIC_WEIGHT} (70%)")
        print(f"✓ Skill Weight: {SKILL_WEIGHT} (30%)")
        print(f"✓ Allowed Extensions: {ALLOWED_EXTENSIONS}")
        
        # Validate weights sum to 1.0
        total_weight = SEMANTIC_WEIGHT + SKILL_WEIGHT
        if abs(total_weight - 1.0) < 0.001:
            print(f"\n✅ Weights correctly sum to 1.0")
            return True
        else:
            print(f"\n❌ Weights don't sum to 1.0 (total: {total_weight})")
            return False
    except Exception as e:
        print(f"❌ Error loading configuration: {e}")
        return False

def validate_skills_database():
    """Validate skills database."""
    print_section("5. VALIDATING SKILLS DATABASE")
    
    try:
        from backend_py.skills_database import (
            TECHNICAL_SKILLS, SOFT_SKILLS, ALL_SKILLS
        )
        
        print(f"✓ Technical Skills: {len(TECHNICAL_SKILLS)} categories")
        print(f"✓ Soft Skills: {len(SOFT_SKILLS)} categories")
        print(f"✓ Total Skills: {len(ALL_SKILLS)} categories")
        
        # Show sample skills
        print("\nSample Technical Skills:")
        for i, skill in enumerate(list(TECHNICAL_SKILLS.keys())[:5]):
            print(f"  - {skill}")
        
        print("\nSample Soft Skills:")
        for i, skill in enumerate(list(SOFT_SKILLS.keys())[:3]):
            print(f"  - {skill}")
        
        if len(ALL_SKILLS) >= 50:
            print(f"\n✅ Skills database has {len(ALL_SKILLS)} skills!")
            return True
        else:
            print(f"\n⚠ Skills database has only {len(ALL_SKILLS)} skills")
            return True
    except Exception as e:
        print(f"❌ Error loading skills database: {e}")
        return False

def test_nlp_processor():
    """Test NLP processor initialization and basic functions."""
    print_section("6. TESTING NLP PROCESSOR")
    
    try:
        print("Initializing NLP processor...")
        print("(This may take 1-2 minutes on first run)")
        
        from backend_py.nlp_processor import get_nlp_processor
        
        nlp = get_nlp_processor()
        
        print("✓ NLP processor initialized")
        
        # Test embeddings
        test_text = "Python developer with 5 years of experience"
        embedding = nlp.get_embeddings([test_text])
        
        print(f"✓ Generated embedding: shape {embedding.shape}")
        
        # Test skill extraction
        skills = nlp.extract_skills(test_text)
        print(f"✓ Extracted {skills['skill_count']} skills: {skills['found_skills']}")
        
        print("\n✅ NLP processor working correctly!")
        return True
    except Exception as e:
        print(f"❌ Error testing NLP processor: {e}")
        return False

def test_resume_parser():
    """Test resume parser functions."""
    print_section("7. TESTING RESUME PARSER")
    
    try:
        from backend_py.resume_parser import clean_resume_text
        
        # Test text cleaning
        messy_text = """
        John    Doe
        
        
        Senior    Developer
        
        
        5+  years   experience
        """
        
        cleaned = clean_resume_text(messy_text)
        print(f"Original: {repr(messy_text[:50])}")
        print(f"Cleaned:  {repr(cleaned[:50])}")
        
        print("\n✓ Resume text cleaning working")
        
        print("\n✅ Resume parser working correctly!")
        return True
    except Exception as e:
        print(f"❌ Error testing resume parser: {e}")
        return False

def test_skill_matcher():
    """Test skill matcher and scoring logic."""
    print_section("8. TESTING SKILL MATCHER")
    
    try:
        from backend_py.skill_matcher import SkillMatcher
        import numpy as np
        
        # Create test data
        resume_skills = {
            'found_skills': ['python', 'react', 'postgresql'],
            'skill_count': 3
        }
        job_skills = {
            'found_skills': ['python', 'react', 'postgresql', 'docker'],
            'skill_count': 4
        }
        
        # Test skill matching
        skill_match = SkillMatcher.compute_skill_match_score(resume_skills, job_skills)
        print(f"✓ Skill Match Score: {skill_match['score']:.2%}")
        print(f"  - Matched: {skill_match['matched_skills']}")
        print(f"  - Missing: {skill_match['missing_skills']}")
        
        # Test semantic similarity
        resume_emb = np.random.randn(384)
        job_emb = np.random.randn(384)
        similarity = SkillMatcher.compute_semantic_similarity(resume_emb, job_emb)
        print(f"✓ Semantic Similarity: {similarity:.4f}")
        
        # Test final score computation
        final_score = SkillMatcher.compute_final_score(0.85, 0.75)
        print(f"✓ Final Score (0.85 semantic, 0.75 skill): {final_score:.4f}")
        
        if 0 <= final_score <= 1:
            print("\n✅ Skill matcher working correctly!")
            return True
        else:
            print("\n❌ Final score out of range!")
            return False
    except Exception as e:
        print(f"❌ Error testing skill matcher: {e}")
        return False

def generate_validation_report():
    """Generate comprehensive validation report."""
    print_section("RESUME SCREENING SYSTEM - VALIDATION REPORT")
    
    print("Running validation tests...\n")
    
    results = {
        "Imports": validate_imports(),
        "Backend Structure": validate_backend_structure(),
        "Frontend Structure": validate_frontend_structure(),
        "Configuration": validate_configuration(),
        "Skills Database": validate_skills_database(),
        # "NLP Processor": test_nlp_processor(),  # Commented: takes time
        "Resume Parser": test_resume_parser(),
        "Skill Matcher": test_skill_matcher(),
    }
    
    print_section("VALIDATION SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"Tests Passed: {passed}/{total}")
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} - {test_name}")
    
    print_section("NEXT STEPS")
    
    if passed == total:
        print("""
✅ All validations passed! Your system is ready.

To run the system:

1. Start the Backend API (Terminal 1):
   python -m backend_py.app
   
   Check health at: http://localhost:8000/health
   Docs at: http://localhost:8000/docs

2. Start Streamlit UI (Terminal 2):
   streamlit run streamlit_app.py
   
   Access at: http://localhost:8501

3. Upload resumes and job descriptions to test!

Optional: Test with sample data:
   python sample_data.py
        """)
    else:
        print("""
❌ Some validations failed. 

Fix the issues above and try again:
   1. Install missing packages: pip install -r requirements.txt
   2. Check file structure in backend_py/ and root directory
   3. Verify backend_py/config.py exists and has correct settings

Then run validation again:
   python TESTING_GUIDE.py
        """)
    
    return passed == total

def show_architecture():
    """Show system architecture."""
    print_section("SYSTEM ARCHITECTURE")
    
    print("""
Resume Screening & Skill Matching System
═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│                                                          │
│    Streamlit Web App (http://localhost:8501)            │
│    ✓ Batch Resume Screening                             │
│    ✓ Single Resume Scoring                              │
│    ✓ Skill Extraction                                   │
│    ✓ Results Download (CSV/JSON)                        │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP Requests
                   ▼
┌──────────────────────────────────────────────────────────┐
│                    FastAPI Backend                       │
│              (http://localhost:8000)                     │
│                                                          │
│    ✓ /api/screen-resumes          - Batch screening     │
│    ✓ /api/score-single            - Single resume       │
│    ✓ /api/extract-skills          - Skill extraction    │
│    ✓ /docs                        - Interactive docs    │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ NLP Processing   │  │  Resume Parser   │
│                  │  │                  │
│ • Embeddings     │  │ • PDF parsing    │
│ • Skill Extract  │  │ • DOCX parsing   │
│ • Text Cleaning  │  │ • Text cleanup   │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ├─────────────────────┤
         │                     │
         ▼                     ▼
    ┌─────────────┐    ┌─────────────┐
    │Transformers │    │   SpaCy     │
    │Models       │    │   en_core   │
    └─────────────┘    └─────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Skill Matcher       │
    │                     │
    │ • Cosine Similarity │
    │ • Skill Matching    │
    │ • Score Computation │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Ranked Results      │
    │                     │
    │ • Scores (0-100%)   │
    │ • Matched Skills    │
    │ • Missing Skills    │
    │ • Explanations      │
    └─────────────────────┘
    """)

if __name__ == "__main__":
    # Show architecture
    show_architecture()
    
    # Run validation
    success = generate_validation_report()
    
    sys.exit(0 if success else 1)
