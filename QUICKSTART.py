"""Quick start guide and sample usage for Resume Screening System."""

"""
QUICK START GUIDE
================

1. Install Dependencies:
   pip install -r requirements.txt

2. Download SpaCy Model (one-time):
   python -m spacy download en_core_web_sm

3. Start Backend API:
   python -m backend_py.app
   OR
   cd backend_py && python app.py
   
   API will be available at: http://localhost:8000
   Documentation at: http://localhost:8000/docs

4. In another terminal, start Streamlit UI:
   streamlit run streamlit_app.py
   
   UI will open at: http://localhost:8501

5. Use the UI to:
   - Upload resume files (PDF or DOCX)
   - Enter job description
   - Get ranked candidates with explanations
   - Download results

SAMPLE API USAGE
================
"""

import requests
import json
from pathlib import Path

def example_api_usage():
    """Example of using the API programmatically."""
    
    # API endpoint
    api_url = "http://localhost:8000"
    
    # Sample job description
    job_description = """
    Senior Full-Stack Engineer
    
    We are looking for an experienced Full-Stack Developer to join our team.
    
    Requirements:
    - 5+ years of professional software development experience
    - Expert-level Python and JavaScript skills
    - Experience with React and FastAPI frameworks
    - Strong backend experience with PostgreSQL and Redis
    - DevOps experience: Docker, Kubernetes, AWS
    - Experience with RESTful APIs and GraphQL
    - Git and CI/CD pipeline experience
    - Agile/Scrum experience
    
    Nice to have:
    - Machine Learning experience
    - Microservices architecture experience
    - Cloud deployment experience (AWS, Azure)
    - Leadership or mentoring experience
    """
    
    # Example 1: Extract skills from job description
    print("=" * 60)
    print("EXAMPLE 1: Extract Skills from Job Description")
    print("=" * 60)
    
    response = requests.get(
        f"{api_url}/api/extract-skills",
        params={"job_description": job_description}
    )
    
    if response.status_code == 200:
        result = response.json()
        if result['status'] == 'success':
            skills = result['data']['skills']
            print(f"\nExtracted {len(skills)} skills:")
            for i, skill in enumerate(skills, 1):
                print(f"  {i}. {skill}")
        else:
            print(f"Error: {result['message']}")
    else:
        print(f"API Error: {response.status_code}")
    
    # Example 2: Score a single resume
    print("\n" + "=" * 60)
    print("EXAMPLE 2: Score Single Resume")
    print("=" * 60)
    
    # Create a sample resume text (in real usage, this would be from a file)
    sample_resume = """
    John Doe
    
    PROFESSIONAL SUMMARY
    Full-stack software engineer with 6 years of experience building scalable web applications.
    
    TECHNICAL SKILLS
    Languages: Python, JavaScript, TypeScript, Go
    Backend: FastAPI, Django, Node.js, Express
    Frontend: React, Vue.js, HTML5, CSS3
    Databases: PostgreSQL, MongoDB, Redis
    DevOps: Docker, Kubernetes, AWS (EC2, S3, Lambda), CI/CD
    Other: Git, REST APIs, GraphQL, Agile, Linux
    
    WORK EXPERIENCE
    Senior Software Engineer - TechCorp (2021-Present)
    - Architected FastAPI microservices processing 10M+ requests daily
    - Built React frontend serving 500K+ daily users
    - Implemented Docker/Kubernetes deployment pipeline
    - Led team of 3 junior engineers
    
    Full Stack Developer - StartupXYZ (2018-2021)
    - Built Django REST APIs
    - Developed React single-page applications
    - Managed PostgreSQL databases
    - Deployed applications on AWS
    
    EDUCATION
    B.S. in Computer Science - State University (2018)
    
    CERTIFICATIONS
    - AWS Solutions Architect Associate
    - Docker Certified Associate
    """
    
    # For actual usage with files:
    # with open("resume.pdf", "rb") as f:
    #     files = [("resume", ("resume.pdf", f, "application/pdf"))]
    
    # For this example, we'll demonstrate the concept
    print("\nSample Resume Analysis:")
    print(f"Name: John Doe")
    print(f"Key Skills in Resume: Python, JavaScript, FastAPI, React, PostgreSQL, Docker, Kubernetes, AWS")
    print("\nTo use with actual files, modify the code to read from file paths")
    
    # Example 3: Demonstrate scoring logic
    print("\n" + "=" * 60)
    print("EXAMPLE 3: Scoring Logic Explanation")
    print("=" * 60)
    
    print("""
    The system uses a weighted scoring formula:
    
    Final Score = 0.7 × Semantic Similarity + 0.3 × Skill Match Score
    
    Example Calculation:
    ───────────────────
    
    1. SEMANTIC SIMILARITY (70% weight)
       - Measures how well resume content matches job description
       - Uses AI embeddings to understand meaning
       - Returns value between 0 and 1
       
       Example: Resume heavily emphasizes Python, FastAPI, React, AWS
                Job description requires same skills
                → Semantic Similarity = 0.88
       
       Contribution: 0.88 × 0.7 = 0.616
    
    2. SKILL MATCH (30% weight)
       - Checks for presence of required skills
       - Required skills: Python, JavaScript, React, FastAPI, PostgreSQL, 
         Redis, Docker, Kubernetes, AWS, Git, GraphQL, Agile
         (12 total skills)
       
       - Candidate has: Python, JavaScript, React, FastAPI, PostgreSQL, 
         Docker, Kubernetes, AWS, Git
         (9 skills - missing Redis and GraphQL, extra skills: TypeScript, Go, Vue)
       
       - Skill Match = 9/12 = 0.75
       
       Contribution: 0.75 × 0.3 = 0.225
    
    3. FINAL SCORE
       Final Score = 0.616 + 0.225 = 0.841 (84.1%)
    
    This candidate would rank very highly!
    """)

if __name__ == "__main__":
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║  Resume Screening & Skill Matching System - Quick Start    ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    print(__doc__)
    
    # Uncomment to run examples (requires API to be running)
    # example_api_usage()
    
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║                    NEXT STEPS                              ║
    ╚════════════════════════════════════════════════════════════╝
    
    1. Start the backend API:
       python -m backend_py.app
    
    2. In another terminal, start Streamlit:
       streamlit run streamlit_app.py
    
    3. Upload resumes and job descriptions to see results!
    
    ═══════════════════════════════════════════════════════════
    """)
