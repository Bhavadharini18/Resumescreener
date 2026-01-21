"""Predefined skills database for matching."""

TECHNICAL_SKILLS = {
    # Programming Languages
    "python": ["python", "py"],
    "javascript": ["javascript", "js", "nodejs", "node.js"],
    "java": ["java"],
    "c++": ["c++", "cpp", "c plus plus"],
    "csharp": ["c#", "csharp", ".net"],
    "go": ["golang", "go"],
    "rust": ["rust"],
    "ruby": ["ruby", "rails"],
    "php": ["php"],
    "swift": ["swift"],
    "kotlin": ["kotlin"],
    
    # Web Technologies
    "react": ["react", "reactjs"],
    "angular": ["angular", "angularjs"],
    "vue": ["vue", "vuejs"],
    "html": ["html", "html5"],
    "css": ["css", "css3", "scss", "sass"],
    "typescript": ["typescript", "ts"],
    "nodejs": ["nodejs", "node.js", "node"],
    "express": ["express", "expressjs"],
    "flask": ["flask"],
    "django": ["django"],
    "fastapi": ["fastapi"],
    
    # Databases
    "sql": ["sql", "sqlserver"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql", "postgres"],
    "mongodb": ["mongodb", "mongo"],
    "redis": ["redis"],
    "elasticsearch": ["elasticsearch"],
    "cassandra": ["cassandra"],
    "dynamodb": ["dynamodb"],
    
    # Cloud & DevOps
    "aws": ["aws", "amazon web services"],
    "azure": ["azure", "microsoft azure"],
    "gcp": ["gcp", "google cloud"],
    "docker": ["docker"],
    "kubernetes": ["kubernetes", "k8s"],
    "ci/cd": ["ci/cd", "cicd", "continuous integration", "continuous deployment"],
    "jenkins": ["jenkins"],
    "gitlab": ["gitlab"],
    "github": ["github"],
    "terraform": ["terraform"],
    "ansible": ["ansible"],
    
    # Data Science & ML
    "machine learning": ["machine learning", "ml"],
    "deep learning": ["deep learning"],
    "nlp": ["nlp", "natural language processing"],
    "tensorflow": ["tensorflow"],
    "pytorch": ["pytorch"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "data analysis": ["data analysis"],
    "data visualization": ["data visualization", "visualization"],
    "tableau": ["tableau"],
    "power bi": ["power bi", "powerbi"],
    
    # Other Technical Skills
    "git": ["git", "version control"],
    "rest api": ["rest api", "restful", "api"],
    "graphql": ["graphql"],
    "microservices": ["microservices"],
    "agile": ["agile"],
    "scrum": ["scrum"],
    "linux": ["linux"],
    "aws": ["aws"],
    "testing": ["testing", "unit testing", "integration testing"],
    "junit": ["junit"],
    "pytest": ["pytest"],
    "soap": ["soap"],
    "xml": ["xml"],
    "json": ["json"],
}

SOFT_SKILLS = {
    "communication": ["communication", "communication skills"],
    "leadership": ["leadership", "leader"],
    "teamwork": ["teamwork", "team collaboration", "collaboration"],
    "problem solving": ["problem solving", "analytical"],
    "project management": ["project management", "pm"],
    "critical thinking": ["critical thinking"],
    "time management": ["time management"],
    "adaptability": ["adaptability", "flexible"],
}

# Combine all skills
ALL_SKILLS = {**TECHNICAL_SKILLS, **SOFT_SKILLS}

# Create lowercase mapping for matching
SKILLS_LOWERCASE = {}
for skill_category, aliases in ALL_SKILLS.items():
    SKILLS_LOWERCASE[skill_category] = [alias.lower() for alias in aliases]
