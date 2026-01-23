"""FastAPI backend for Resume Screening System."""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import logging
from pymongo import MongoClient
import numpy as np
from datetime import datetime

from .config import ALLOWED_EXTENSIONS
from .resume_parser import extract_text_from_resume, clean_resume_text
from .nlp_processor import get_nlp_processor
from .skill_matcher import CandidateScorer, SkillMatcher
from .utils import (
    format_score_report,
    generate_summary_report,
    validate_file_extension,
    sanitize_filename,
    create_error_response,
    create_success_response
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Resume Screening & Skill Matching API",
    description="API for screening resumes and ranking candidates based on job descriptions",
    version="1.0.0"
)


# Request models
class MatchCandidatesRequest(BaseModel):
    """Request model for candidate matching."""
    jobDescription: str
    requiredSkills: Optional[List[str]] = None
    jobTitle: Optional[str] = None
    company: Optional[str] = None

class ApplyJobRequest(BaseModel):
    """Request model for job application."""
    jobId: str
    jobTitle: str
    jobDescription: str
    requiredSkills: Optional[List[str]] = None
    candidateId: str
    candidateName: str
    candidateEmail: str
    resumeText: str
    candidateSkills: Optional[List[str]] = None

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize NLP processor on startup."""
    logger.info("Initializing NLP processor...")
    get_nlp_processor()
    logger.info("NLP processor initialized successfully")


def get_mongodb_client():
    """Get MongoDB client connection."""
    try:
        client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=3000)
        # Try to connect
        client.admin.command('ping')
        return client
    except Exception as e:
        logger.error(f"MongoDB connection error: {str(e)}")
        return None


@app.post("/api/match-candidates")
async def match_candidates(request: MatchCandidatesRequest):
    """
    Match candidates from database against a job description.
    
    Args:
        request: MatchCandidatesRequest containing job description and optional skills
        
    Returns:
        List of matched candidates with match percentages and scores
    """
    try:
        if not request.jobDescription or not request.jobDescription.strip():
            raise HTTPException(
                status_code=400,
                detail="Job description cannot be empty"
            )
        
        logger.info("Matching candidates against job description...")
        
        # Get job skills from request or extract from job description using NLP
        job_skills = request.requiredSkills if request.requiredSkills else []
        
        # If no explicit skills provided, extract them from job description using NLP
        if not job_skills:
            try:
                job_skills_data = nlp.extract_skills(request.jobDescription)
                job_skills = job_skills_data.get('found_skills', [])
                logger.info(f"Extracted job skills from description: {job_skills}")
            except Exception as e:
                logger.warning(f"Could not extract skills from job description: {str(e)}")
                job_skills = []
        else:
            logger.info(f"Using provided job required skills: {job_skills}")
        
        # Fetch candidates from MongoDB
        candidates_data = []
        try:
            client = get_mongodb_client()
            if client:
                db = client['resume-shortlister']
                candidates_collection = db['candidates']
                
                # Fetch all candidates
                db_candidates = list(candidates_collection.find({}, {
                    'name': 1,
                    'email': 1,
                    'skills': 1,
                    'experienceYears': 1,
                    'resumeText': 1
                }).limit(100))
                
                for candidate in db_candidates:
                    candidates_data.append({
                        'name': candidate.get('name', 'Unknown'),
                        'email': candidate.get('email', 'N/A'),
                        'phone': candidate.get('phone', 'N/A'),
                        'experience': f"{candidate.get('experienceYears', 0)} years",
                        'skills': candidate.get('skills', []),
                        'resumeText': candidate.get('resumeText', '')
                    })
                
                client.close()
                logger.info(f"Fetched {len(candidates_data)} candidates from MongoDB")
        except Exception as e:
            logger.warning(f"Could not fetch from MongoDB: {str(e)}. Using sample data.")
            # Fallback to sample data if MongoDB is not available
            candidates_data = [
                {
                    "name": "John Developer",
                    "email": "john@example.com",
                    "phone": "+1-555-0101",
                    "experience": "5 years",
                    "skills": ["Python", "JavaScript", "React", "Node.js", "MongoDB"],
                    "resumeText": "Experienced Python developer with expertise in JavaScript, React, Node.js and MongoDB. 5 years of experience building full-stack web applications."
                },
                {
                    "name": "Sarah Engineer",
                    "email": "sarah@example.com",
                    "phone": "+1-555-0102",
                    "experience": "7 years",
                    "skills": ["Java", "Python", "Spring Boot", "AWS", "Docker", "Kubernetes"],
                    "resumeText": "Senior software engineer with 7 years of experience in Java, Python, Spring Boot. Proficient in AWS, Docker, and Kubernetes for cloud deployment."
                },
                {
                    "name": "Mike Designer",
                    "email": "mike@example.com",
                    "phone": "+1-555-0103",
                    "experience": "3 years",
                    "skills": ["Figma", "CSS", "HTML", "React"],
                    "resumeText": "Frontend developer with 3 years of experience. Expert in Figma design, CSS styling, HTML markup, and React components."
                }
            ]
        
        if not candidates_data:
            return create_success_response(
                data={'matches': []},
                message="No candidates found in database"
            )
        
        # Use NLP and transformers for intelligent matching
        try:
            nlp = get_nlp_processor()
            
            # Get job description embedding for semantic similarity
            job_embedding = nlp.get_embeddings([request.jobDescription])[0]
            
            # Score each candidate using NLP and transformers
            matched_candidates = []
            
            for candidate in candidates_data:
                # Extract candidate resume text or create from skills
                resume_text = candidate.get('resumeText', '')
                if not resume_text and candidate.get('skills'):
                    resume_text = f"Skills: {', '.join(candidate.get('skills', []))}"
                
                if not resume_text:
                    resume_text = candidate['name']
                
                # Get candidate embedding
                candidate_embedding = nlp.get_embeddings([resume_text])[0]
                
                # Calculate semantic similarity using transformer embeddings
                semantic_score = float(np.dot(job_embedding, candidate_embedding) / (
                    np.linalg.norm(job_embedding) * np.linalg.norm(candidate_embedding) + 1e-10
                ))
                semantic_score = max(0.0, min(1.0, semantic_score))  # Clamp between 0 and 1
                
                # Calculate skill match score using NLP skill extraction
                # Extract skills from candidate's resume/skills using NLP
                candidate_skills_data = nlp.extract_skills(resume_text)
                candidate_skills_extracted = candidate_skills_data.get('found_skills', [])
                
                # Get explicitly listed skills from database (candidate.skills)
                explicit_candidate_skills = candidate.get('skills', [])
                
                # Normalize all candidate skills to lowercase for comparison
                candidate_skills_extracted_lower = [s.lower() for s in candidate_skills_extracted]
                explicit_candidate_skills_lower = [s.lower() for s in explicit_candidate_skills]
                
                # Combine all candidate skills
                all_candidate_skills = set(candidate_skills_extracted_lower + explicit_candidate_skills_lower)
                
                logger.info(f"\n{'='*80}")
                logger.info(f"Candidate: {candidate['name']}")
                logger.info(f"  Explicit DB Skills (candidate.skills): {explicit_candidate_skills}")
                logger.info(f"  Extracted Resume Skills: {candidate_skills_extracted}")
                logger.info(f"  Combined All Skills: {sorted(all_candidate_skills)}")
                logger.info(f"Job Required Skills: {job_skills}")
                logger.info(f"{'='*80}\n")
                
                # Find matched skills by comparing with job requirements
                matched_skills = []
                missing_skills = []
                
                if job_skills:
                    for job_skill in job_skills:
                        job_skill_lower = job_skill.lower()
                        # Check if job skill is in candidate's skills (using skills database normalization)
                        if job_skill_lower in all_candidate_skills:
                            matched_skills.append(job_skill)
                        else:
                            missing_skills.append(job_skill)
                    
                    skill_score = len(matched_skills) / len(job_skills) if job_skills else 0.0
                    logger.info(f"  ✓ Matched Skills: {matched_skills}")
                    logger.info(f"  ✗ Missing Skills: {missing_skills}")
                    logger.info(f"  Skill Score: {skill_score*100:.1f}%")
                    logger.info(f"  Semantic Score: {semantic_score*100:.1f}%")
                    logger.info(f"  Final Match: {round(final_score * 100, 1)}%\n")
                else:
                    skill_score = 0.5  # Default if no skills specified
                
                # Combine scores using the formula: 0.7 * semantic + 0.3 * skill
                final_score = (0.7 * semantic_score) + (0.3 * skill_score)
                match_percentage = round(final_score * 100, 1)
                
                # Only include candidates with at least some relevancy
                if match_percentage > 0:
                    matched_candidates.append({
                        "name": candidate['name'],
                        "email": candidate['email'],
                        "phone": candidate['phone'],
                        "experience": candidate['experience'],
                        "skills": candidate.get('skills', []),
                        "matchPercentage": match_percentage,
                        "matchedSkills": matched_skills,
                        "missingSkills": missing_skills,
                        "semanticScore": round(semantic_score, 3),
                        "skillScore": round(skill_score, 3),
                        "finalScore": round(final_score, 3)
                    })
            
            # Sort by match percentage (descending)
            matched_candidates.sort(key=lambda x: x['matchPercentage'], reverse=True)
            
            response_data = {
                'matches': matched_candidates,
                'requiredSkills': job_skills,
                'totalMatches': len(matched_candidates),
                'totalCandidates': len(candidates_data),
                'jobTitle': request.jobTitle or 'N/A',
                'company': request.company or 'N/A',
                'matchingMethod': 'NLP + Transformer Embeddings (0.7 semantic + 0.3 skill match)'
            }
            
            logger.info(f"NLP Matching completed: {len(matched_candidates)} candidates matched using transformer embeddings")
            return create_success_response(
                data=response_data,
                message="Candidate matching completed successfully using NLP algorithms"
            )
            
        except Exception as e:
            logger.error(f"Error during NLP matching: {str(e)}")
            # Fallback to skill matching with NLP extraction
            logger.info("Falling back to NLP-based skill extraction matching...")
            
            nlp = get_nlp_processor()
            
            # Extract job skills using NLP
            job_skills_data = nlp.extract_skills(request.jobDescription)
            job_skills_extracted = job_skills_data.get('found_skills', [])
            job_skills_lower = [s.lower() for s in job_skills] if job_skills else []
            job_skills_extracted_lower = [s.lower() for s in job_skills_extracted]
            all_job_skills = set(job_skills_lower + job_skills_extracted_lower)
            
            # Fallback to NLP-based skill matching if transformers fail
            matched_candidates = []
            for candidate in candidates_data:
                resume_text = candidate.get('resumeText', '')
                if not resume_text and candidate.get('skills'):
                    resume_text = f"Skills: {', '.join(candidate.get('skills', []))}"
                
                # Extract skills using NLP
                candidate_skills_data = nlp.extract_skills(resume_text)
                candidate_skills_extracted = candidate_skills_data.get('found_skills', [])
                candidate_skills_explicit = [s.lower() for s in (candidate.get('skills') or [])]
                all_candidate_skills = set([s.lower() for s in candidate_skills_extracted] + candidate_skills_explicit)
                
                # Find matched and missing skills
                matched_skills = [s for s in all_job_skills if s in all_candidate_skills]
                missing_skills = [s for s in all_job_skills if s not in all_candidate_skills]
                
                if all_job_skills:
                    match_percentage = (len(matched_skills) / len(all_job_skills)) * 100
                else:
                    match_percentage = 50
                
                match_percentage = min(100, max(0, match_percentage))
                
                if match_percentage > 0:
                    matched_candidates.append({
                        "name": candidate['name'],
                        "email": candidate['email'],
                        "phone": candidate['phone'],
                        "experience": candidate['experience'],
                        "skills": candidate.get('skills', []),
                        "matchPercentage": round(match_percentage, 1),
                        "matchedSkills": list(matched_skills),
                        "missingSkills": list(missing_skills),
                        "semanticScore": round(match_percentage / 100, 3),
                        "skillScore": round(match_percentage / 100, 3),
                        "finalScore": round(match_percentage / 100, 3)
                    })
            
            matched_candidates.sort(key=lambda x: x['matchPercentage'], reverse=True)
            
            response_data = {
                'matches': matched_candidates,
                'requiredSkills': list(all_job_skills),
                'totalMatches': len(matched_candidates),
                'totalCandidates': len(candidates_data),
                'jobTitle': request.jobTitle or 'N/A',
                'company': request.company or 'N/A',
                'matchingMethod': 'Simple Skill Matching (Fallback)'
            }
            
            logger.info(f"Fallback matching completed: {len(matched_candidates)} candidates matched")
            return create_success_response(
                data=response_data,
                message="Candidate matching completed using fallback method"
            )
        
    except HTTPException as e:
        logger.error(f"HTTP Error: {e.detail}")
        return create_error_response(
            error_code="HTTP_ERROR",
            error_message=e.detail
        )
    except Exception as e:
        logger.error(f"Error matching candidates: {str(e)}")
        return create_error_response(
            error_code="MATCHING_ERROR",
            error_message="Error while matching candidates",
            details=str(e)
        )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return create_success_response(
        data={"status": "healthy"},
        message="API is running"
    )


class MatchJobsRequest(BaseModel):
    """Request model for job matching."""
    candidateSkills: List[str]
    resume: Optional[str] = None


@app.post("/api/match-jobs")
async def match_jobs(request: MatchJobsRequest):
    """
    Match jobs from database against candidate's skills.
    
    Args:
        request: MatchJobsRequest containing candidate skills and resume text
        
    Returns:
        List of matched jobs with match percentages and scores
    """
    try:
        if not request.candidateSkills or len(request.candidateSkills) == 0:
            raise HTTPException(
                status_code=400,
                detail="Candidate skills cannot be empty"
            )
        
        logger.info("Matching jobs against candidate skills...")
        
        # Get jobs from MongoDB or Node.js backend
        jobs_data = []
        try:
            # Try to fetch from Node.js backend API
            import requests
            response = requests.get('http://localhost:5000/api/jobs', timeout=5)
            if response.status_code == 200:
                jobs_data = response.json()
                logger.info(f"Fetched {len(jobs_data)} jobs from Node.js backend")
        except Exception as e:
            logger.warning(f"Could not fetch jobs from Node.js backend: {str(e)}")
            # Fallback to sample jobs
            jobs_data = [
                {
                    "id": 1,
                    "title": "Python Full Stack Developer",
                    "company": "Tech Startup Inc.",
                    "description": "We are looking for a Python full stack developer with experience in Django, Flask, React and PostgreSQL. Must have 3+ years of experience.",
                    "requiredSkills": ["Python", "Django", "React", "PostgreSQL", "JavaScript"],
                    "salary": "$80,000 - $120,000"
                },
                {
                    "id": 2,
                    "title": "Frontend React Developer",
                    "company": "Creative Digital Solutions",
                    "description": "Seeking experienced React developer with strong CSS and JavaScript skills. Experience with TypeScript, Redux and testing frameworks required.",
                    "requiredSkills": ["React", "JavaScript", "CSS", "TypeScript", "Testing"],
                    "salary": "$70,000 - $110,000"
                },
                {
                    "id": 3,
                    "title": "Node.js Backend Engineer",
                    "company": "Cloud Systems Ltd",
                    "description": "Looking for Node.js backend engineer with experience in Express, MongoDB, AWS. Must have 4+ years of experience with microservices.",
                    "requiredSkills": ["Node.js", "Express", "MongoDB", "AWS", "Microservices"],
                    "salary": "$85,000 - $130,000"
                },
                {
                    "id": 4,
                    "title": "Data Science Engineer",
                    "company": "AI Analytics Corp",
                    "description": "Seeking data scientist with expertise in Python, Machine Learning, TensorFlow and Big Data technologies. PhD or Masters preferred.",
                    "requiredSkills": ["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics"],
                    "salary": "$90,000 - $140,000"
                }
            ]
        
        if not jobs_data:
            return create_success_response(
                data={'matches': []},
                message="No jobs found in database"
            )
        
        # Use NLP and transformers for intelligent matching
        try:
            nlp = get_nlp_processor()
            
            # Extract candidate skills using NLP from input skills
            candidate_skills_data = nlp.extract_skills(' '.join(request.candidateSkills))
            candidate_skills_extracted = candidate_skills_data.get('found_skills', [])
            
            # Also add the input skills directly
            candidate_skills_lower = [s.lower() for s in request.candidateSkills]
            candidate_skills_extracted_lower = [s.lower() for s in candidate_skills_extracted]
            
            # Combine both sources
            all_candidate_skills = set(candidate_skills_lower + candidate_skills_extracted_lower)
            
            logger.info(f"Candidate skills (extracted + input): {list(all_candidate_skills)}")
            
            # Get candidate embedding from skills
            candidate_text = ' '.join(request.candidateSkills)
            if request.resume:
                candidate_text += ' ' + request.resume
            
            candidate_embedding = nlp.get_embeddings([candidate_text])[0]
            
            # Score each job using NLP and transformers
            matched_jobs = []
            
            for job in jobs_data:
                # Get job description embedding
                job_desc = job.get('description', '')
                if not job_desc:
                    job_desc = f"{job.get('title', '')} {' '.join(job.get('requiredSkills', []))}"
                
                job_embedding = nlp.get_embeddings([job_desc])[0]
                
                # Calculate semantic similarity using transformer embeddings
                semantic_score = float(np.dot(candidate_embedding, job_embedding) / (
                    np.linalg.norm(candidate_embedding) * np.linalg.norm(job_embedding) + 1e-10
                ))
                semantic_score = max(0.0, min(1.0, semantic_score))  # Clamp between 0 and 1
                
                # Calculate skill match score using NLP skill extraction
                job_skills = job.get('requiredSkills', [])
                job_skills_data = nlp.extract_skills(' '.join(job_skills) if job_skills else job_desc)
                job_skills_extracted = job_skills_data.get('found_skills', [])
                
                # Combine explicit and extracted job skills
                job_skills_lower = [s.lower() for s in (job_skills or [])]
                job_skills_extracted_lower = [s.lower() for s in job_skills_extracted]
                all_job_skills = set(job_skills_lower + job_skills_extracted_lower)
                
                # Find matched and missing skills
                matched_skills = []
                missing_skills = []
                
                if all_job_skills:
                    for job_skill in all_job_skills:
                        # Check if job skill matches any candidate skill
                        if job_skill in all_candidate_skills:
                            matched_skills.append(job_skill)
                        else:
                            missing_skills.append(job_skill)
                    
                    skill_score = len(matched_skills) / len(all_job_skills) if all_job_skills else 0.0
                else:
                    skill_score = 0.5  # Default if no skills specified
                
                # Combine scores using the formula: 0.7 * semantic + 0.3 * skill
                final_score = (0.7 * semantic_score) + (0.3 * skill_score)
                match_percentage = round(final_score * 100, 1)
                
                # Include all jobs (they will be sorted by match)
                matched_jobs.append({
                    "id": job.get('id', ''),
                    "title": job.get('title', 'N/A'),
                    "company": job.get('company', 'N/A'),
                    "description": job.get('description', ''),
                    "requiredSkills": job_skills,
                    "matchPercentage": match_percentage,
                    "matchedSkills": matched_skills,
                    "missingSkills": missing_skills,
                    "semanticScore": round(semantic_score, 3),
                    "skillScore": round(skill_score, 3),
                    "salary": job.get('salary', 'N/A')
                })
            
            # Sort by match percentage (descending)
            matched_jobs.sort(key=lambda x: x['matchPercentage'], reverse=True)
            
            response_data = {
                'matches': matched_jobs,
                'jobSkills': request.candidateSkills,
                'totalMatches': len([j for j in matched_jobs if j['matchPercentage'] >= 40]),
                'totalJobs': len(jobs_data),
                'matchingMethod': 'NLP + Transformer Embeddings (0.7 semantic + 0.3 skill match)'
            }
            
            logger.info(f"Job matching completed: {len(matched_jobs)} jobs analyzed using transformer embeddings")
            return create_success_response(
                data=response_data,
                message="Job matching completed successfully using NLP algorithms"
            )
            
        except Exception as e:
            logger.error(f"Error during NLP job matching: {str(e)}")
            # Fallback to NLP-based skill matching
            logger.info("Falling back to NLP-based skill matching for jobs...")
            
            nlp = get_nlp_processor()
            
            # Extract candidate skills using NLP
            candidate_skills_data = nlp.extract_skills(' '.join(request.candidateSkills))
            candidate_skills_extracted = candidate_skills_data.get('found_skills', [])
            candidate_skills_input_lower = [s.lower() for s in request.candidateSkills]
            all_candidate_skills = set(candidate_skills_input_lower + [s.lower() for s in candidate_skills_extracted])
            
            matched_jobs = []
            for job in jobs_data:
                # Extract job skills using NLP
                job_skills = job.get('requiredSkills', [])
                job_desc = job.get('description', '')
                job_skills_data = nlp.extract_skills(' '.join(job_skills) if job_skills else job_desc)
                job_skills_extracted = job_skills_data.get('found_skills', [])
                
                job_skills_lower = [s.lower() for s in (job_skills or [])]
                job_skills_extracted_lower = [s.lower() for s in job_skills_extracted]
                all_job_skills = set(job_skills_lower + job_skills_extracted_lower)
                
                # Find matched and missing skills
                matched_skills = [s for s in all_job_skills if s in all_candidate_skills]
                missing_skills = [s for s in all_job_skills if s not in all_candidate_skills]
                
                if all_job_skills:
                    match_percentage = (len(matched_skills) / len(all_job_skills)) * 100
                else:
                    match_percentage = 50
                
                match_percentage = min(100, max(0, match_percentage))
                
                matched_jobs.append({
                    "id": job.get('id', ''),
                    "title": job.get('title', 'N/A'),
                    "company": job.get('company', 'N/A'),
                    "description": job.get('description', ''),
                    "requiredSkills": list(all_job_skills),
                    "matchPercentage": round(match_percentage, 1),
                    "matchedSkills": list(matched_skills),
                    "missingSkills": list(missing_skills),
                    "semanticScore": round(match_percentage / 100, 3),
                    "skillScore": round(match_percentage / 100, 3),
                    "salary": job.get('salary', 'N/A')
                })
            
            matched_jobs.sort(key=lambda x: x['matchPercentage'], reverse=True)
            
            response_data = {
                'matches': matched_jobs,
                'jobSkills': list(all_candidate_skills),
                'totalMatches': len([j for j in matched_jobs if j['matchPercentage'] >= 40]),
                'totalJobs': len(jobs_data),
                'matchingMethod': 'NLP-Based Skill Extraction (Fallback)'
            }
            
            logger.info(f"Fallback job matching completed: {len(matched_jobs)} jobs analyzed")
            return create_success_response(
                data=response_data,
                message="Job matching completed using fallback method"
            )
        
    except HTTPException as e:
        logger.error(f"HTTP Error: {e.detail}")
        return create_error_response(
            error_code="HTTP_ERROR",
            error_message=e.detail
        )
    except Exception as e:
        logger.error(f"Error matching jobs: {str(e)}")
        return create_error_response(
            error_code="JOB_MATCHING_ERROR",
            error_message="Error while matching jobs",
            details=str(e)
        )


@app.post("/api/screen-resumes")
async def screen_resumes(
    resumes: List[UploadFile] = File(..., description="Resume files (PDF or DOCX)"),
    job_description: str = Form(..., description="Job description text")
):
    """
    Screen multiple resumes against a job description.
    
    Args:
        resumes: List of uploaded resume files
        job_description: Job description text
        
    Returns:
        Ranked list of candidates with scores and explanations
    """
    try:
        if not job_description or not job_description.strip():
            raise HTTPException(
                status_code=400,
                detail="Job description cannot be empty"
            )
        
        if not resumes:
            raise HTTPException(
                status_code=400,
                detail="At least one resume must be uploaded"
            )
        
        if len(resumes) > 50:
            raise HTTPException(
                status_code=400,
                detail="Maximum 50 resumes can be processed at once"
            )
        
        logger.info(f"Processing {len(resumes)} resumes...")
        
        # Initialize NLP processor
        nlp = get_nlp_processor()
        
        # Process job description
        logger.info("Processing job description...")
        job_data = nlp.process_job_description(job_description)
        
        # Process resumes
        resumes_data = []
        candidate_names = []
        
        for resume_file in resumes:
            try:
                # Validate file
                if not validate_file_extension(resume_file.filename, ALLOWED_EXTENSIONS):
                    logger.warning(f"Skipping {resume_file.filename}: unsupported format")
                    continue
                
                # Read file content
                file_content = await resume_file.read()
                
                # Extract text
                resume_text, file_type = extract_text_from_resume(
                    file_content,
                    resume_file.filename
                )
                
                # Clean text
                resume_text = clean_resume_text(resume_text)
                
                # Process resume
                resume_data = nlp.process_resume(resume_text)
                resumes_data.append(resume_data)
                candidate_names.append(sanitize_filename(resume_file.filename))
                
                logger.info(f"Successfully processed: {resume_file.filename}")
                
            except Exception as e:
                logger.error(f"Error processing {resume_file.filename}: {str(e)}")
                continue
        
        if not resumes_data:
            raise HTTPException(
                status_code=400,
                detail="Could not process any resume files successfully"
            )
        
        # Score candidates
        logger.info(f"Scoring {len(resumes_data)} candidates...")
        ranked_candidates = CandidateScorer.score_batch(
            resumes_data,
            job_data,
            candidate_names
        )
        
        # Format results
        formatted_results = [
            format_score_report(candidate)
            for candidate in ranked_candidates
        ]
        
        # Generate summary
        summary = generate_summary_report(ranked_candidates)
        
        response_data = {
            'job_description_summary': {
                'required_skills': job_data['skills']['found_skills'],
                'skill_count': job_data['skills']['skill_count'],
            },
            'summary': summary,
            'ranked_candidates': formatted_results,
            'screening_complete': True
        }
        
        logger.info("Screening completed successfully")
        return create_success_response(
            data=response_data,
            message="Resume screening completed successfully"
        )
        
    except HTTPException as e:
        logger.error(f"HTTP Error: {e.detail}")
        return create_error_response(
            error_code="HTTP_ERROR",
            error_message=e.detail
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_error_response(
            error_code="INTERNAL_ERROR",
            error_message="An unexpected error occurred during screening",
            details=str(e)
        )


@app.post("/api/score-single")
async def score_single_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Score a single resume against a job description.
    
    Args:
        resume: Single resume file
        job_description: Job description text
        
    Returns:
        Detailed score and explanation
    """
    try:
        if not job_description or not job_description.strip():
            raise HTTPException(
                status_code=400,
                detail="Job description cannot be empty"
            )
        
        # Validate file
        if not validate_file_extension(resume.filename, ALLOWED_EXTENSIONS):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        logger.info(f"Scoring single resume: {resume.filename}")
        
        # Initialize NLP processor
        nlp = get_nlp_processor()
        
        # Process job description
        job_data = nlp.process_job_description(job_description)
        
        # Read and process resume
        file_content = await resume.read()
        resume_text, _ = extract_text_from_resume(file_content, resume.filename)
        resume_text = clean_resume_text(resume_text)
        resume_data = nlp.process_resume(resume_text)
        
        # Score
        candidate_name = sanitize_filename(resume.filename)
        score_result = CandidateScorer.score_candidate(
            resume_data,
            job_data,
            candidate_name
        )
        score_result['rank'] = 1  # Only one candidate
        
        # Format result
        formatted_result = format_score_report(score_result)
        
        return create_success_response(
            data=formatted_result,
            message="Resume scored successfully"
        )
        
    except HTTPException as e:
        return create_error_response(
            error_code="HTTP_ERROR",
            error_message=e.detail
        )
    except Exception as e:
        logger.error(f"Error scoring resume: {str(e)}")
        return create_error_response(
            error_code="SCORING_ERROR",
            error_message="Error while scoring resume",
            details=str(e)
        )


@app.get("/api/extract-skills")
async def extract_skills(job_description: str):
    """
    Extract skills from a job description.
    
    Args:
        job_description: Job description text
        
    Returns:
        List of extracted skills
    """
    try:
        if not job_description or not job_description.strip():
            raise HTTPException(
                status_code=400,
                detail="Job description cannot be empty"
            )
        
        nlp = get_nlp_processor()
        skills_result = nlp.extract_skills(job_description)
        
        return create_success_response(
            data={
                'skills': skills_result['found_skills'],
                'skill_count': skills_result['skill_count'],
                'details': skills_result['skills_detail']
            },
            message="Skills extracted successfully"
        )
        
    except HTTPException as e:
        return create_error_response(
            error_code="HTTP_ERROR",
            error_message=e.detail
        )
    except Exception as e:
        logger.error(f"Error extracting skills: {str(e)}")
        return create_error_response(
            error_code="EXTRACTION_ERROR",
            error_message="Error extracting skills",
            details=str(e)
        )


@app.get("/api/latest-candidate")
async def get_latest_candidate():
    """Get the latest uploaded candidate data."""
    try:
        client = get_mongodb_client()
        if client:
            db = client['resume-shortlister']
            candidates_collection = db['candidates']
            latest = candidates_collection.find_one({}, sort=[('_id', -1)])
            client.close()
            
            if latest:
                return create_success_response(
                    data={
                        'id': str(latest.get('_id', '')),
                        'name': latest.get('name', 'Unknown'),
                        'email': latest.get('email', ''),
                        'resumeText': latest.get('resumeText', ''),
                        'skills': latest.get('skills', [])
                    }
                )
        
        return create_success_response(data={'name': 'Candidate', 'email': '', 'resumeText': '', 'skills': []})
    except Exception as e:
        logger.error(f"Error fetching latest candidate: {str(e)}")
        return create_success_response(data={'name': 'Candidate', 'email': '', 'resumeText': '', 'skills': []})


@app.post("/api/apply-job")
async def apply_job(request: ApplyJobRequest):
    """
    Apply for a job and get resume matching analysis.
    Returns match percentage, matched skills, missing skills, and improvement suggestions.
    Also stores the application for the recruiter to see.
    """
    try:
        if not request.jobDescription or not request.jobDescription.strip():
            raise HTTPException(status_code=400, detail="Job description cannot be empty")
        
        logger.info(f"Processing job application for {request.candidateName} - Job: {request.jobTitle}")
        
        try:
            nlp = get_nlp_processor()
        except Exception as e:
            logger.error(f"NLP processor error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"NLP initialization failed: {str(e)}")
        
        # Get job skills
        job_skills = request.requiredSkills if request.requiredSkills else []
        if not job_skills:
            try:
                job_skills_data = nlp.extract_skills(request.jobDescription)
                job_skills = job_skills_data.get('found_skills', [])
            except Exception as e:
                logger.warning(f"Skill extraction failed: {str(e)}")
                job_skills = []
        
        # Get candidate resume and skills
        resume_text = request.resumeText or f"Skills: {', '.join(request.candidateSkills or [])}"
        candidate_skills = request.candidateSkills or []
        
        if not resume_text or resume_text.strip() == "":
            resume_text = f"Candidate {request.candidateName}"
        
        try:
            # Generate embeddings
            job_embedding = nlp.get_embeddings([request.jobDescription])[0]
            candidate_embedding = nlp.get_embeddings([resume_text])[0]
            
            # Calculate semantic similarity
            semantic_score = float(np.dot(job_embedding, candidate_embedding) / (
                np.linalg.norm(job_embedding) * np.linalg.norm(candidate_embedding) + 1e-10
            ))
            semantic_score = max(0.0, min(1.0, semantic_score))
        except Exception as e:
            logger.error(f"Embedding error: {str(e)}")
            semantic_score = 0.5
        
        try:
            # Extract skills using NLP
            candidate_skills_data = nlp.extract_skills(resume_text)
            candidate_skills_extracted = candidate_skills_data.get('found_skills', [])
        except Exception as e:
            logger.warning(f"Candidate skill extraction failed: {str(e)}")
            candidate_skills_extracted = []
        
        # Combine all candidate skills
        candidate_skills_lower = set([s.lower() for s in (candidate_skills or [])])
        candidate_skills_extracted_lower = set([s.lower() for s in candidate_skills_extracted])
        all_candidate_skills = candidate_skills_lower.union(candidate_skills_extracted_lower)
        
        # Find matched and missing skills
        matched_skills = []
        missing_skills = []
        
        if job_skills:
            for job_skill in job_skills:
                if job_skill.lower() in all_candidate_skills:
                    matched_skills.append(job_skill)
                else:
                    missing_skills.append(job_skill)
            skill_score = len(matched_skills) / len(job_skills) if job_skills else 0.0
        else:
            skill_score = 0.5
        
        # Combine scores
        final_score = (0.7 * semantic_score) + (0.3 * skill_score)
        match_percentage = round(final_score * 100, 1)
        
        # Generate improvement suggestions
        improvements = []
        if missing_skills:
            improvements.append(f"Learn: {', '.join(missing_skills[:3])}")
        improvements.append("Add specific project examples to your resume")
        improvements.append("Include quantifiable achievements and metrics")
        if matched_skills:
            improvements.append(f"Highlight your experience with: {', '.join(matched_skills[:3])}")
        improvements.append("Use keywords from the job description in your resume")
        
        # Store application in database with duplicate prevention
        try:
            client = get_mongodb_client()
            if client:
                db = client['resume-shortlister']
                applications_collection = db['applications']
                
                # Check for duplicate application (same candidate email + job ID)
                import hashlib
                duplicate_key = hashlib.md5(
                    f"{request.candidateEmail.lower()}_{request.jobId}".encode()
                ).hexdigest()
                
                existing_application = applications_collection.find_one({
                    'duplicateKey': duplicate_key
                })
                
                if existing_application:
                    # Update existing application instead of creating duplicate
                    applications_collection.update_one(
                        {'duplicateKey': duplicate_key},
                        {
                            '$set': {
                                'matchPercentage': match_percentage,
                                'matchedSkills': matched_skills,
                                'missingSkills': missing_skills,
                                'semanticScore': float(semantic_score),
                                'skillScore': float(skill_score),
                                'appliedAt': datetime.utcnow(),
                                'updatedAt': datetime.utcnow()
                            }
                        }
                    )
                    logger.info(f"Updated existing application for {request.candidateEmail} - Job: {request.jobId}")
                else:
                    # Create new application
                    application = {
                        'jobId': request.jobId,
                        'jobTitle': request.jobTitle,
                        'candidateId': request.candidateId,
                        'candidateName': request.candidateName,
                        'candidateEmail': request.candidateEmail,
                        'matchPercentage': match_percentage,
                        'matchedSkills': matched_skills,
                        'missingSkills': missing_skills,
                        'semanticScore': float(semantic_score),
                        'skillScore': float(skill_score),
                        'duplicateKey': duplicate_key,  # For duplicate prevention
                        'appliedAt': datetime.utcnow(),
                        'updatedAt': datetime.utcnow()
                    }
                    
                    result = applications_collection.insert_one(application)
                    logger.info(f"Application stored with ID: {result.inserted_id}")
                client.close()
        except Exception as e:
            logger.warning(f"Could not store application in database: {str(e)}")
        
        response_data = {
            'matchPercentage': match_percentage,
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'semantic_score': semantic_score,
            'skill_score': skill_score,
            'improvements': improvements,
            'jobTitle': request.jobTitle,
            'candidateName': request.candidateName,
            'message': f"Your resume is {match_percentage}% matched to the {request.jobTitle} position."
        }
        
        logger.info(f"Application processed - Match: {match_percentage}%")
        return create_success_response(data=response_data)
        
    except HTTPException as e:
        logger.error(f"HTTP Error in job application: {e.detail}")
        return create_error_response(error_code="HTTP_ERROR", error_message=str(e.detail))
    except Exception as e:
        logger.error(f"Error applying for job: {str(e)}", exc_info=True)
        return create_error_response(error_code="APPLICATION_ERROR", error_message="Error processing job application", details=str(e))



@app.post("/api/apply-job-with-resume")
async def apply_job_with_resume(
    resume: UploadFile = File(None, description="Resume file (PDF or DOCX)"),
    candidate_name: str = Form(..., description="Candidate name"),
    candidate_email: str = Form(..., description="Candidate email"),
    job_id: str = Form(..., description="Job ID"),
    job_title: str = Form(..., description="Job title"),
    job_description: str = Form(..., description="Job description"),
    required_skills: Optional[str] = Form(None, description="Comma-separated required skills"),
    candidate_skills: Optional[str] = Form(None, description="Comma-separated candidate skills")
):
    """
    Apply for a job with resume file upload or skills text input.
    Handles both resume file uploads and text-based skill inputs.
    Returns match percentage, matched skills, missing skills, and improvement suggestions.
    """
    try:
        if not job_description or not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description cannot be empty")
        
        if not candidate_name or not candidate_name.strip():
            raise HTTPException(status_code=400, detail="Candidate name is required")
        
        if not candidate_email or not candidate_email.strip():
            raise HTTPException(status_code=400, detail="Candidate email is required")
        
        logger.info(f"Processing job application for {candidate_name} - Job: {job_title}")
        
        # Initialize NLP processor
        try:
            nlp = get_nlp_processor()
        except Exception as e:
            logger.error(f"NLP processor error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"NLP initialization failed: {str(e)}")
        
        # Extract resume text from file if provided
        resume_text = ""
        extracted_candidate_skills = []
        
        if resume and resume.filename:
            try:
                # Validate file extension
                if not validate_file_extension(resume.filename, ALLOWED_EXTENSIONS):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Unsupported file format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
                    )
                
                # Read and extract text from resume file
                file_content = await resume.read()
                resume_text, file_type = extract_text_from_resume(file_content, resume.filename)
                resume_text = clean_resume_text(resume_text)
                
                # Extract skills from resume using NLP
                candidate_skills_data = nlp.extract_skills(resume_text)
                extracted_candidate_skills = candidate_skills_data.get('found_skills', [])
                
                logger.info(f"Extracted {len(extracted_candidate_skills)} skills from resume: {resume.filename}")
            except Exception as e:
                logger.error(f"Error processing resume file: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Error processing resume: {str(e)}")
        else:
            # Use provided skills text if no file uploaded
            if candidate_skills:
                skills_list = [s.strip() for s in candidate_skills.split(',') if s.strip()]
                resume_text = f"Skills: {', '.join(skills_list)}"
                extracted_candidate_skills = skills_list
            else:
                resume_text = f"Candidate {candidate_name}"
        
        # Parse required skills
        job_skills = []
        if required_skills:
            job_skills = [s.strip() for s in required_skills.split(',') if s.strip()]
        
        # Extract job skills from description if not provided
        if not job_skills:
            try:
                job_skills_data = nlp.extract_skills(job_description)
                job_skills = job_skills_data.get('found_skills', [])
            except Exception as e:
                logger.warning(f"Skill extraction from job description failed: {str(e)}")
                job_skills = []
        
        # Generate embeddings for semantic similarity
        try:
            job_embedding = nlp.get_embeddings([job_description])[0]
            candidate_embedding = nlp.get_embeddings([resume_text])[0]
            
            # Calculate semantic similarity
            semantic_score = float(np.dot(job_embedding, candidate_embedding) / (
                np.linalg.norm(job_embedding) * np.linalg.norm(candidate_embedding) + 1e-10
            ))
            semantic_score = max(0.0, min(1.0, semantic_score))
        except Exception as e:
            logger.error(f"Embedding error: {str(e)}")
            semantic_score = 0.5
        
        # Extract additional skills from resume text using NLP
        if resume_text and not extracted_candidate_skills:
            try:
                candidate_skills_data = nlp.extract_skills(resume_text)
                extracted_candidate_skills = candidate_skills_data.get('found_skills', [])
            except Exception as e:
                logger.warning(f"Candidate skill extraction failed: {str(e)}")
        
        # Combine all candidate skills (from file extraction + provided skills)
        all_candidate_skills = set([s.lower() for s in extracted_candidate_skills])
        
        # Find matched and missing skills
        matched_skills = []
        missing_skills = []
        
        if job_skills:
            for job_skill in job_skills:
                if job_skill.lower() in all_candidate_skills:
                    matched_skills.append(job_skill)
                else:
                    missing_skills.append(job_skill)
            skill_score = len(matched_skills) / len(job_skills) if job_skills else 0.0
        else:
            skill_score = 0.5
        
        # Calculate final match percentage
        final_score = (0.7 * semantic_score) + (0.3 * skill_score)
        match_percentage = round(final_score * 100, 1)
        
        # Generate improvement suggestions
        improvements = []
        if missing_skills:
            improvements.append(f"Learn these skills: {', '.join(missing_skills[:5])}")
        improvements.append("Add specific project examples to your resume")
        improvements.append("Include quantifiable achievements and metrics")
        if matched_skills:
            improvements.append(f"Highlight your experience with: {', '.join(matched_skills[:3])}")
        improvements.append("Use keywords from the job description in your resume")
        
        # Store application in database with duplicate prevention
        try:
            client = get_mongodb_client()
            if client:
                db = client['resume-shortlister']
                applications_collection = db['applications']
                
                # Check for duplicate application (same candidate email + job ID)
                import hashlib
                duplicate_key = hashlib.md5(
                    f"{candidate_email.lower()}_{job_id}".encode()
                ).hexdigest()
                
                existing_application = applications_collection.find_one({
                    'duplicateKey': duplicate_key
                })
                
                if existing_application:
                    # Update existing application instead of creating duplicate
                    applications_collection.update_one(
                        {'duplicateKey': duplicate_key},
                        {
                            '$set': {
                                'matchPercentage': match_percentage,
                                'matchedSkills': matched_skills,
                                'missingSkills': missing_skills,
                                'semanticScore': float(semantic_score),
                                'skillScore': float(skill_score),
                                'appliedAt': datetime.utcnow(),
                                'updatedAt': datetime.utcnow()
                            }
                        }
                    )
                    logger.info(f"Updated existing application for {candidate_email} - Job: {job_id}")
                else:
                    # Create new application
                    application = {
                        'jobId': job_id,
                        'jobTitle': job_title,
                        'candidateId': f'candidate_{datetime.utcnow().timestamp()}',
                        'candidateName': candidate_name,
                        'candidateEmail': candidate_email,
                        'matchPercentage': match_percentage,
                        'matchedSkills': matched_skills,
                        'missingSkills': missing_skills,
                        'semanticScore': float(semantic_score),
                        'skillScore': float(skill_score),
                        'duplicateKey': duplicate_key,  # For duplicate prevention
                        'appliedAt': datetime.utcnow(),
                        'updatedAt': datetime.utcnow()
                    }
                    
                    result = applications_collection.insert_one(application)
                    logger.info(f"Application stored with ID: {result.inserted_id}")
                client.close()
        except Exception as e:
            logger.warning(f"Could not store application in database: {str(e)}")
        
        response_data = {
            'matchPercentage': match_percentage,
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'semantic_score': semantic_score,
            'skill_score': skill_score,
            'improvements': improvements,
            'jobTitle': job_title,
            'candidateName': candidate_name,
            'message': f"Your resume is {match_percentage}% matched to the {job_title} position."
        }
        
        logger.info(f"Application processed - Match: {match_percentage}%")
        return create_success_response(data=response_data)
        
    except HTTPException as e:
        logger.error(f"HTTP Error in job application: {e.detail}")
        return create_error_response(error_code="HTTP_ERROR", error_message=str(e.detail))
    except Exception as e:
        logger.error(f"Error applying for job: {str(e)}", exc_info=True)
        return create_error_response(error_code="APPLICATION_ERROR", error_message="Error processing job application", details=str(e))


@app.get("/api/explore-jobs")
async def explore_jobs():
    """
    Get all jobs for the Explore page with detailed information.
    Returns comprehensive job data including skills, requirements, and metadata.
    """
    try:
        # Try to fetch from Node.js backend first, then fallback to sample data
        jobs_data = []
        try:
            import requests
            response = requests.get('http://localhost:5000/api/jobs', timeout=5)
            if response.status_code == 200:
                jobs_data = response.json()
                logger.info(f"Fetched {len(jobs_data)} jobs from Node.js backend")
        except Exception as e:
            logger.warning(f"Could not fetch jobs from Node.js backend: {str(e)}")
        
        # Fallback to sample jobs if no backend available
        if not jobs_data:
            jobs_data = [
                {
                    "id": 1,
                    "title": "Senior Python Developer",
                    "company": "TechCorp Inc.",
                    "location": "San Francisco, CA",
                    "type": "Full-time",
                    "experience": "Senior",
                    "description": "We are looking for an experienced Python developer with expertise in Django, Flask, and cloud technologies. You will be working on scalable web applications and microservices architecture.",
                    "requiredSkills": ["Python", "Django", "Flask", "PostgreSQL", "AWS", "Docker", "REST API"],
                    "optionalSkills": ["React", "Redis", "Kubernetes", "GraphQL"],
                    "salary": "$120,000 - $160,000",
                    "posted": "2 days ago"
                },
                {
                    "id": 2,
                    "title": "Frontend React Developer",
                    "company": "Digital Solutions Ltd",
                    "location": "New York, NY",
                    "type": "Full-time",
                    "experience": "Mid-level",
                    "description": "Join our frontend team to build amazing user interfaces using React, TypeScript, and modern CSS frameworks. Experience with state management and testing required.",
                    "requiredSkills": ["React", "JavaScript", "TypeScript", "CSS", "HTML", "Redux"],
                    "optionalSkills": ["Next.js", "Vue.js", "Angular", "Testing Libraries"],
                    "salary": "$90,000 - $120,000",
                    "posted": "1 week ago"
                },
                {
                    "id": 3,
                    "title": "Full Stack Node.js Engineer",
                    "company": "StartupHub",
                    "location": "Remote",
                    "type": "Full-time",
                    "experience": "Mid-level",
                    "description": "Looking for a versatile Node.js developer who can handle both frontend and backend development. Experience with Express, MongoDB, and modern frontend frameworks required.",
                    "requiredSkills": ["Node.js", "Express", "MongoDB", "JavaScript", "React", "REST API"],
                    "optionalSkills": ["TypeScript", "PostgreSQL", "Docker", "AWS", "GraphQL"],
                    "salary": "$100,000 - $140,000",
                    "posted": "3 days ago"
                },
                {
                    "id": 4,
                    "title": "Data Science Engineer",
                    "company": "AI Analytics Corp",
                    "location": "Boston, MA",
                    "type": "Full-time",
                    "experience": "Senior",
                    "description": "Seeking a data scientist with strong Python skills and experience in machine learning, deep learning, and big data technologies. PhD or Masters preferred.",
                    "requiredSkills": ["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics", "Data Analysis"],
                    "optionalSkills": ["PyTorch", "Scikit-learn", "Big Data", "AWS", "Docker"],
                    "salary": "$130,000 - $180,000",
                    "posted": "1 day ago"
                },
                {
                    "id": 5,
                    "title": "DevOps Engineer",
                    "company": "Cloud Systems Inc",
                    "location": "Seattle, WA",
                    "type": "Full-time",
                    "experience": "Mid-level",
                    "description": "We need a DevOps engineer to manage our cloud infrastructure, implement CI/CD pipelines, and ensure system reliability. Experience with AWS and containerization required.",
                    "requiredSkills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Bash"],
                    "optionalSkills": ["Terraform", "Ansible", "Monitoring Tools", "Networking"],
                    "salary": "$110,000 - $150,000",
                    "posted": "4 days ago"
                },
                {
                    "id": 6,
                    "title": "Mobile React Native Developer",
                    "company": "AppWorks Studio",
                    "location": "Austin, TX",
                    "type": "Full-time",
                    "experience": "Mid-level",
                    "description": "Create amazing mobile experiences using React Native. You'll work on iOS and Android apps, collaborate with designers, and implement best practices for mobile development.",
                    "requiredSkills": ["React Native", "JavaScript", "React", "Mobile Development", "iOS", "Android"],
                    "optionalSkills": ["TypeScript", "Redux", "Native Modules", "Performance Optimization"],
                    "salary": "$95,000 - $130,000",
                    "posted": "5 days ago"
                }
            ]
        
        # Extract all unique skills from jobs for skills analysis
        all_skills = set()
        for job in jobs_data:
            if job.get('requiredSkills'):
                all_skills.update(job['requiredSkills'])
            if job.get('optionalSkills'):
                all_skills.update(job['optionalSkills'])
        
        # Create skills analysis data
        skills_analysis = []
        for skill in all_skills:
            required_count = sum(1 for job in jobs_data if job.get('requiredSkills') and skill in job['requiredSkills'])
            optional_count = sum(1 for job in jobs_data if job.get('optionalSkills') and skill in job['optionalSkills'])
            total_count = required_count + optional_count
            
            skills_analysis.append({
                "name": skill,
                "requiredIn": required_count,
                "optionalIn": optional_count,
                "totalJobs": total_count,
                "importance": "core" if required_count > total_count * 0.5 else "optional"
            })
        
        # Sort skills by total jobs
        skills_analysis.sort(key=lambda x: x['totalJobs'], reverse=True)
        
        response_data = {
            "jobs": jobs_data,
            "skills": skills_analysis,
            "totalJobs": len(jobs_data),
            "totalSkills": len(skills_analysis)
        }
        
        return create_success_response(
            data=response_data,
            message=f"Found {len(jobs_data)} jobs and {len(skills_analysis)} unique skills"
        )
        
    except Exception as e:
        logger.error(f"Error fetching explore jobs: {str(e)}")
        return create_error_response(
            error_code="EXPLORE_JOBS_ERROR",
            error_message="Error fetching jobs and skills data",
            details=str(e)
        )


@app.get("/api/job-applications/{job_id}")
async def get_job_applications(job_id: str):
    """
    Get all applications for a specific job (for recruiter dashboard).
    """
    try:
        client = get_mongodb_client()
        if client:
            db = client['resume-shortlister']
            applications_collection = db['applications']
            
            applications = list(applications_collection.find({'jobId': job_id}))
            client.close()
            
            # Convert ObjectId to string for JSON serialization
            applications = [
                {
                    'candidateName': app.get('candidateName', ''),
                    'candidateEmail': app.get('candidateEmail', ''),
                    'matchPercentage': app.get('matchPercentage', 0),
                    'matchedSkills': app.get('matchedSkills', []),
                    'missingSkills': app.get('missingSkills', []),
                    'semanticScore': app.get('semanticScore', 0),
                    'skillScore': app.get('skillScore', 0),
                    'appliedAt': str(app.get('appliedAt', '')),
                    '_id': str(app.get('_id', ''))
                } for app in applications
            ]
            
            # Sort by match percentage (descending)
            applications.sort(key=lambda x: x.get('matchPercentage', 0), reverse=True)
            
            return create_success_response(
                data=applications,
                message=f"Found {len(applications)} applications for job"
            )
        
        return create_success_response(data=[])
    except Exception as e:
        logger.error(f"Error fetching job applications: {str(e)}")
        return create_error_response(error_code="FETCH_ERROR", error_message="Error fetching applications", details=str(e))


if __name__ == "__main__":
    import uvicorn
    from config import API_HOST, API_PORT
    
    uvicorn.run(
        app,
        host=API_HOST,
        port=API_PORT,
        log_level="info"
    )
