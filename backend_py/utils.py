"""Utility functions for the resume screening system."""

from typing import List, Dict, Any
import json
from datetime import datetime


def format_score_report(score_data: Dict) -> Dict:
    """
    Format scoring data for API response.
    
    Args:
        score_data: Raw score data from CandidateScorer
        
    Returns:
        Formatted report dictionary
    """
    return {
        'candidate_name': score_data['candidate_name'],
        'rank': score_data['rank'],
        'final_score': score_data['final_score'],
        'final_score_percentage': score_data['final_score_percentage'],
        'semantic_similarity': score_data['semantic_similarity'],
        'semantic_similarity_percentage': round(score_data['semantic_similarity'] * 100, 2),
        'skill_match': {
            'score': score_data['skill_match']['score'],
            'percentage': score_data['skill_match']['match_percentage'],
            'matched_skills': score_data['skill_match']['matched_skills'],
            'missing_skills': score_data['skill_match']['missing_skills'],
            'additional_skills': score_data['skill_match']['additional_skills'],
            'matched_count': score_data['skill_match']['matched_count'],
            'required_count': score_data['skill_match']['required_count'],
        },
        'explanation': {
            'matched_skills_explanation': f"Found {score_data['skill_match']['matched_count']} out of {score_data['skill_match']['required_count']} required skills.",
            'missing_skills_explanation': f"Missing {len(score_data['skill_match']['missing_skills'])} required skills: {', '.join(score_data['skill_match']['missing_skills']) if score_data['skill_match']['missing_skills'] else 'None'}",
            'semantic_explanation': f"Resume content similarity to job description: {round(score_data['semantic_similarity'] * 100, 2)}%"
        }
    }


def generate_summary_report(ranked_candidates: List[Dict]) -> Dict:
    """
    Generate a summary report of all ranked candidates.
    
    Args:
        ranked_candidates: List of scored and ranked candidates
        
    Returns:
        Summary report dictionary
    """
    if not ranked_candidates:
        return {
            'total_candidates': 0,
            'average_score': 0,
            'top_candidate': None,
            'candidates_summary': []
        }
    
    average_score = sum(c['final_score'] for c in ranked_candidates) / len(ranked_candidates)
    
    summary = {
        'total_candidates': len(ranked_candidates),
        'average_score': round(average_score, 4),
        'average_score_percentage': round(average_score * 100, 2),
        'top_candidate': ranked_candidates[0]['candidate_name'] if ranked_candidates else None,
        'top_candidate_score': ranked_candidates[0]['final_score'] if ranked_candidates else 0,
        'candidates_summary': [
            {
                'rank': c['rank'],
                'candidate_name': c['candidate_name'],
                'final_score': c['final_score'],
                'final_score_percentage': c['final_score_percentage'],
                'matched_skills': c['skill_match']['matched_count'],
                'required_skills': c['skill_match']['required_count'],
            }
            for c in ranked_candidates
        ]
    }
    
    return summary


def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
    """
    Validate if file has allowed extension.
    
    Args:
        filename: Name of the file
        allowed_extensions: List of allowed extensions (without dots)
        
    Returns:
        True if file extension is allowed
    """
    if '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in allowed_extensions


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to extract candidate name.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized candidate name
    """
    # Remove file extension
    name = filename.rsplit('.', 1)[0] if '.' in filename else filename
    
    # Replace underscores and hyphens with spaces
    name = name.replace('_', ' ').replace('-', ' ')
    
    # Title case
    name = name.title()
    
    return name.strip()


def create_error_response(error_code: str, error_message: str, details: str = None) -> Dict:
    """
    Create standardized error response.
    
    Args:
        error_code: Error code identifier
        error_message: Human-readable error message
        details: Additional error details
        
    Returns:
        Error response dictionary
    """
    response = {
        'status': 'error',
        'error_code': error_code,
        'message': error_message,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if details:
        response['details'] = details
    
    return response


def create_success_response(data: Any, message: str = "Success") -> Dict:
    """
    Create standardized success response.
    
    Args:
        data: Response data
        message: Success message
        
    Returns:
        Success response dictionary
    """
    return {
        'status': 'success',
        'message': message,
        'data': data,
        'timestamp': datetime.utcnow().isoformat()
    }
