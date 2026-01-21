"""Skill matching and similarity computation module."""

from typing import Dict, List, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from .config import SEMANTIC_WEIGHT, SKILL_WEIGHT


class SkillMatcher:
    """Handles skill matching and scoring logic."""
    
    @staticmethod
    def compute_skill_match_score(
        resume_skills: Dict,
        job_skills: Dict
    ) -> Dict[str, any]:
        """
        Compute skill match score between resume and job description.
        
        Args:
            resume_skills: Skills extracted from resume
            job_skills: Skills required for job
            
        Returns:
            Dictionary containing:
            - score: Match score (0-1)
            - matched_skills: Skills present in both resume and job
            - missing_skills: Skills required but not in resume
            - additional_skills: Skills in resume but not required
            - matched_count: Number of matched skills
            - required_count: Number of required skills
        """
        resume_skill_set = set(resume_skills['found_skills'])
        job_skill_set = set(job_skills['found_skills'])
        
        # Calculate intersections
        matched_skills = resume_skill_set.intersection(job_skill_set)
        missing_skills = job_skill_set - resume_skill_set
        additional_skills = resume_skill_set - job_skill_set
        
        # Calculate score
        if len(job_skill_set) == 0:
            # No skills required, give full score if no specific skills needed
            skill_score = 1.0
        else:
            skill_score = len(matched_skills) / len(job_skill_set)
        
        return {
            'score': skill_score,
            'matched_skills': sorted(list(matched_skills)),
            'missing_skills': sorted(list(missing_skills)),
            'additional_skills': sorted(list(additional_skills)),
            'matched_count': len(matched_skills),
            'required_count': len(job_skill_set),
            'match_percentage': round(skill_score * 100, 2)
        }
    
    @staticmethod
    def compute_semantic_similarity(
        resume_embedding: np.ndarray,
        job_embedding: np.ndarray
    ) -> float:
        """
        Compute semantic similarity between resume and job description.
        
        Args:
            resume_embedding: Embedding vector for resume
            job_embedding: Embedding vector for job description
            
        Returns:
            Similarity score (0-1)
        """
        # Cosine similarity returns [[score]]
        similarity = cosine_similarity(
            resume_embedding.reshape(1, -1),
            job_embedding.reshape(1, -1)
        )[0][0]
        
        return float(similarity)
    
    @staticmethod
    def compute_final_score(
        semantic_similarity: float,
        skill_match_score: float
    ) -> float:
        """
        Compute final match score using weighted combination.
        
        Formula: score = 0.7 × semantic_similarity + 0.3 × skill_match_score
        
        Args:
            semantic_similarity: Semantic similarity score (0-1)
            skill_match_score: Skill match score (0-1)
            
        Returns:
            Final score (0-1)
        """
        final_score = (
            SEMANTIC_WEIGHT * semantic_similarity +
            SKILL_WEIGHT * skill_match_score
        )
        
        return float(final_score)
    
    @staticmethod
    def rank_candidates(
        candidates: List[Dict],
        reverse: bool = True
    ) -> List[Dict]:
        """
        Rank candidates by their final score.
        
        Args:
            candidates: List of candidate scoring results
            reverse: If True, sort descending (highest score first)
            
        Returns:
            Sorted list of candidates
        """
        sorted_candidates = sorted(
            candidates,
            key=lambda x: x['final_score'],
            reverse=reverse
        )
        
        # Add rank
        for rank, candidate in enumerate(sorted_candidates, 1):
            candidate['rank'] = rank
        
        return sorted_candidates


class CandidateScorer:
    """Orchestrates the complete scoring pipeline."""
    
    @staticmethod
    def score_candidate(
        resume_data: Dict,
        job_data: Dict,
        candidate_name: str = "Unknown"
    ) -> Dict:
        """
        Generate complete score for a candidate against a job.
        
        Args:
            resume_data: Processed resume data (from NLPProcessor.process_resume)
            job_data: Processed job data (from NLPProcessor.process_job_description)
            candidate_name: Name of the candidate
            
        Returns:
            Comprehensive scoring report
        """
        # Compute semantic similarity
        semantic_sim = SkillMatcher.compute_semantic_similarity(
            resume_data['embedding'],
            job_data['embedding']
        )
        
        # Compute skill match
        skill_match = SkillMatcher.compute_skill_match_score(
            resume_data['skills'],
            job_data['skills']
        )
        
        # Compute final score
        final_score = SkillMatcher.compute_final_score(
            semantic_sim,
            skill_match['score']
        )
        
        return {
            'candidate_name': candidate_name,
            'semantic_similarity': round(semantic_sim, 4),
            'skill_match': skill_match,
            'final_score': round(final_score, 4),
            'final_score_percentage': round(final_score * 100, 2),
            'resume_skills': resume_data['skills'],
            'job_required_skills': job_data['skills'],
            'rank': None  # Will be filled after ranking
        }
    
    @staticmethod
    def score_batch(
        resumes_data: List[Dict],
        job_data: Dict,
        candidate_names: List[str] = None
    ) -> List[Dict]:
        """
        Score multiple candidates against a job description.
        
        Args:
            resumes_data: List of processed resume data
            job_data: Processed job data
            candidate_names: Optional list of candidate names
            
        Returns:
            Ranked list of scored candidates
        """
        if candidate_names is None:
            candidate_names = [f"Candidate_{i+1}" for i in range(len(resumes_data))]
        
        scores = []
        for resume_data, candidate_name in zip(resumes_data, candidate_names):
            score = CandidateScorer.score_candidate(
                resume_data,
                job_data,
                candidate_name
            )
            scores.append(score)
        
        # Rank candidates
        ranked_scores = SkillMatcher.rank_candidates(scores)
        
        return ranked_scores
