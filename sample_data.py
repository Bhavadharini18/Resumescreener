"""Sample data and testing utilities."""

# Sample job descriptions for testing
SAMPLE_JOB_DESCRIPTIONS = {
    "senior_python_developer": """
        Senior Python Developer
        
        We are seeking an experienced Python Developer to lead our backend team.
        
        Requirements:
        - 5+ years of professional Python development
        - Expert knowledge of FastAPI or Django
        - Experience with microservices architecture
        - Strong SQL and NoSQL database skills (PostgreSQL, MongoDB)
        - Docker and Kubernetes experience
        - CI/CD pipeline experience
        - Experience with distributed systems
        - Strong problem-solving and communication skills
        
        Nice to have:
        - Machine learning experience
        - AWS or Azure cloud experience
        - Experience mentoring junior developers
        - Open source contributions
    """,
    
    "frontend_react_developer": """
        Frontend React Developer
        
        Join our frontend team to build beautiful, responsive web applications.
        
        Requirements:
        - 3+ years of React experience
        - Expert level JavaScript and TypeScript
        - HTML5 and CSS3 proficiency
        - REST API and GraphQL experience
        - Git version control
        - Agile methodology experience
        - Testing frameworks (Jest, React Testing Library)
        - Responsive design expertise
        
        Nice to have:
        - Next.js experience
        - State management (Redux, Zustand)
        - UI component libraries
        - Performance optimization
    """,
    
    "devops_engineer": """
        DevOps Engineer
        
        Help us build and maintain our infrastructure and deployment pipelines.
        
        Requirements:
        - Docker and Kubernetes expertise
        - CI/CD pipeline experience (Jenkins, GitLab CI, GitHub Actions)
        - Cloud platforms (AWS, Azure, or GCP)
        - Infrastructure as Code (Terraform, Ansible)
        - Linux system administration
        - Monitoring and logging tools (Prometheus, ELK, Datadog)
        - Networking fundamentals
        
        Nice to have:
        - Helm charts experience
        - Service mesh experience (Istio)
        - Python or Go scripting
        - Security and compliance knowledge
    """
}

# Sample resumes for testing (in text format)
SAMPLE_RESUMES = {
    "alice_fullstack": """
        Alice Johnson
        Full Stack Software Engineer
        
        PROFESSIONAL SUMMARY
        Experienced full-stack engineer with 6 years of experience building 
        scalable web applications using Python, React, and cloud technologies.
        
        TECHNICAL SKILLS
        Languages: Python, JavaScript, TypeScript, SQL
        Backend: FastAPI, Django, REST APIs
        Frontend: React, HTML5, CSS3, Redux
        Databases: PostgreSQL, MongoDB, Redis
        DevOps: Docker, Kubernetes, AWS, CI/CD
        Tools: Git, Linux, Agile
        
        EXPERIENCE
        Senior Engineer at TechCorp (2021-Present)
        - Architected FastAPI microservices for 5M+ daily users
        - Built React dashboards for analytics
        - Implemented Docker/Kubernetes deployment
        - Mentored 2 junior engineers
        
        Full Stack Developer at StartupXYZ (2018-2021)
        - Developed Django REST APIs
        - Created React single-page applications
        - Managed PostgreSQL databases
        - Deployed to AWS
        
        EDUCATION
        B.S. Computer Science, State University (2018)
        
        CERTIFICATIONS
        AWS Solutions Architect Associate
    """,
    
    "bob_frontend": """
        Bob Chen
        Frontend Developer
        
        PROFESSIONAL SUMMARY
        Frontend specialist with 4 years of React experience. 
        Passionate about creating responsive, user-friendly web interfaces.
        
        TECHNICAL SKILLS
        Languages: JavaScript, TypeScript
        Frontend: React, Vue.js, HTML5, CSS3, Bootstrap
        Testing: Jest, React Testing Library
        Tools: Git, VS Code, Figma
        APIs: REST, GraphQL
        
        EXPERIENCE
        Frontend Developer at WebDesigns (2020-Present)
        - Built responsive React applications
        - Created reusable component library
        - Implemented unit tests with Jest
        - Collaborated with designers and backend team
        
        Junior Developer at DesignStudio (2019-2020)
        - Developed Vue.js applications
        - HTML/CSS layouts
        - JavaScript functionality
        
        EDUCATION
        B.S. Web Development, Tech Institute (2019)
        
        SKILLS
        JavaScript 90%, React 85%, CSS 80%, TypeScript 75%
    """,
    
    "charlie_devops": """
        Charlie Williams
        DevOps & Infrastructure Engineer
        
        PROFESSIONAL SUMMARY
        Infrastructure specialist with 5 years of DevOps experience.
        Expert in containerization, orchestration, and cloud deployment.
        
        TECHNICAL SKILLS
        Containerization: Docker, Podman
        Orchestration: Kubernetes, Docker Swarm
        Cloud: AWS (EC2, S3, Lambda, RDS), Azure basics
        IaC: Terraform, Ansible, CloudFormation
        CI/CD: Jenkins, GitLab CI, GitHub Actions
        Monitoring: Prometheus, Grafana, ELK Stack
        OS: Linux (Ubuntu, CentOS), Windows Server
        Languages: Python, Bash, YAML
        
        EXPERIENCE
        DevOps Engineer at CloudSystems (2020-Present)
        - Maintained Kubernetes clusters with 200+ pods
        - Automated infrastructure with Terraform
        - Built CI/CD pipelines using GitLab CI
        - Managed monitoring with Prometheus/Grafana
        
        Systems Administrator at CorpIT (2018-2020)
        - Linux server administration
        - Docker implementation
        - Backup and disaster recovery
        
        EDUCATION
        B.S. Information Systems, University (2018)
        
        CERTIFICATIONS
        Certified Kubernetes Administrator (CKA)
        AWS Certified Solutions Architect
    """
}

def get_sample_job_description(job_type: str = "senior_python_developer") -> str:
    """Get a sample job description for testing."""
    return SAMPLE_JOB_DESCRIPTIONS.get(
        job_type,
        SAMPLE_JOB_DESCRIPTIONS["senior_python_developer"]
    )

def get_sample_resume(resume_type: str = "alice_fullstack") -> str:
    """Get a sample resume for testing."""
    return SAMPLE_RESUMES.get(
        resume_type,
        SAMPLE_RESUMES["alice_fullstack"]
    )

def get_all_sample_jobs() -> dict:
    """Get all sample job descriptions."""
    return SAMPLE_JOB_DESCRIPTIONS

def get_all_sample_resumes() -> dict:
    """Get all sample resumes."""
    return SAMPLE_RESUMES

# Example evaluation scenarios
EVALUATION_SCENARIOS = {
    "scenario_1": {
        "name": "Perfect Match",
        "job": "senior_python_developer",
        "resume": "alice_fullstack",
        "expected_score_range": (0.75, 0.95),
        "explanation": "Alice has all required skills for Python developer role"
    },
    "scenario_2": {
        "name": "Skills Mismatch",
        "job": "devops_engineer",
        "resume": "bob_frontend",
        "expected_score_range": (0.20, 0.50),
        "explanation": "Bob is frontend developer but job requires DevOps skills"
    },
    "scenario_3": {
        "name": "Partial Match",
        "job": "senior_python_developer",
        "resume": "charlie_devops",
        "expected_score_range": (0.40, 0.70),
        "explanation": "Charlie has some Python/Linux skills but lacks backend focus"
    }
}

if __name__ == "__main__":
    print("Sample Data Available:")
    print("\nJobs:")
    for job_type in SAMPLE_JOB_DESCRIPTIONS:
        print(f"  - {job_type}")
    
    print("\nResumes:")
    for resume_type in SAMPLE_RESUMES:
        print(f"  - {resume_type}")
    
    print("\nEvaluation Scenarios:")
    for scenario_id, scenario_data in EVALUATION_SCENARIOS.items():
        print(f"\n  {scenario_id}: {scenario_data['name']}")
        print(f"    Job: {scenario_data['job']}")
        print(f"    Resume: {scenario_data['resume']}")
        print(f"    Expected Score Range: {scenario_data['expected_score_range']}")
        print(f"    Explanation: {scenario_data['explanation']}")
