"""Configuration and constants for Resume Screening System."""

# Model configurations
MODEL_NAME = "all-MiniLM-L6-v2"  # Lightweight, fast sentence transformer
SPACY_MODEL = "en_core_web_sm"   # SpaCy model for NER

# Scoring weights
SEMANTIC_WEIGHT = 0.7
SKILL_WEIGHT = 0.3

# Similarity thresholds
SKILL_MATCH_THRESHOLD = 0.85  # Cosine similarity threshold for skill matching

# File upload settings
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}

# Processing settings
BATCH_SIZE = 32
TOP_K_SKILLS = 10  # Number of top skills to extract

# API settings
API_HOST = "0.0.0.0"
API_PORT = 8000
