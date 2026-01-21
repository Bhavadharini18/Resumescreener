"""NLP processing module for generating embeddings and extracting skills."""

import re
from typing import List, Dict, Tuple, Set
import numpy as np
import spacy
from sentence_transformers import SentenceTransformer

from .config import MODEL_NAME, SPACY_MODEL, TOP_K_SKILLS
from .skills_database import SKILLS_LOWERCASE


class NLPProcessor:
    """Main NLP processor for embeddings and skill extraction."""
    
    def __init__(self):
        """Initialize NLP models."""
        self.embedding_model = SentenceTransformer(MODEL_NAME)
        self.nlp = None
        try:
            self.nlp = spacy.load(SPACY_MODEL)
        except OSError:
            print(f"Note: SpaCy model {SPACY_MODEL} not loaded. NER features will be limited.")
            # Continue without spacy - it's optional for the matching endpoint
            pass
    
    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for a list of texts.
        
        Args:
            texts: List of text strings to embed
            
        Returns:
            NumPy array of embeddings (shape: [n_texts, embedding_dim])
        """
        embeddings = self.embedding_model.encode(texts, show_progress_bar=False)
        return np.array(embeddings)
    
    def extract_skills(self, text: str) -> Dict[str, Dict]:
        """
        Extract skills from text using pattern matching.
        
        Args:
            text: Input text to extract skills from
            
        Returns:
            Dictionary with skill details including:
            - found_skills: List of matched skills
            - skills_detail: Details about each skill (name, aliases_matched)
            - skill_count: Total number of unique skills found
        """
        text_lower = text.lower()
        found_skills: Set[str] = set()
        skills_detail: Dict[str, Dict] = {}
        
        # Search for each skill and its aliases
        for skill_name, aliases in SKILLS_LOWERCASE.items():
            for alias in aliases:
                # Use word boundaries to match whole words
                pattern = r'\b' + re.escape(alias) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.add(skill_name)
                    if skill_name not in skills_detail:
                        skills_detail[skill_name] = {
                            'aliases_matched': []
                        }
                    skills_detail[skill_name]['aliases_matched'].append(alias)
                    break  # Only need to match once per skill
        
        return {
            'found_skills': sorted(list(found_skills)),
            'skills_detail': skills_detail,
            'skill_count': len(found_skills),
            'skills_list': sorted(list(found_skills))
        }
    
    def extract_key_phrases(self, text: str, max_phrases: int = 5) -> List[str]:
        """
        Extract key phrases from text using NER.
        
        Args:
            text: Input text
            max_phrases: Maximum number of phrases to extract
            
        Returns:
            List of key phrases (entities)
        """
        if not self.nlp:
            return []  # Return empty list if spacy model not loaded
            
        doc = self.nlp(text[:5000])  # Limit to first 5000 chars for performance
        
        entities = []
        for ent in doc.ents:
            if ent.label_ in ['ORG', 'PRODUCT', 'GPE']:
                entities.append(ent.text)
        
        return entities[:max_phrases]
    
    def process_resume(self, text: str) -> Dict:
        """
        Complete processing of a resume.
        
        Args:
            text: Resume text content
            
        Returns:
            Dictionary containing:
            - embedding: The resume embedding vector
            - skills: Extracted skills
            - key_entities: Key phrases from resume
        """
        # Generate embedding
        embedding = self.get_embeddings([text])[0]
        
        # Extract skills
        skills = self.extract_skills(text)
        
        # Extract key entities
        key_entities = self.extract_key_phrases(text)
        
        return {
            'embedding': embedding,
            'skills': skills,
            'key_entities': key_entities,
            'text': text
        }
    
    def process_job_description(self, text: str) -> Dict:
        """
        Complete processing of a job description.
        
        Args:
            text: Job description text content
            
        Returns:
            Dictionary containing:
            - embedding: The job description embedding vector
            - skills: Required skills
            - key_entities: Key phrases from job description
        """
        # Generate embedding
        embedding = self.get_embeddings([text])[0]
        
        # Extract required skills
        skills = self.extract_skills(text)
        
        # Extract key information
        key_entities = self.extract_key_phrases(text)
        
        return {
            'embedding': embedding,
            'skills': skills,
            'key_entities': key_entities,
            'text': text
        }


# Global instance
_nlp_processor: NLPProcessor = None


def get_nlp_processor() -> NLPProcessor:
    """Get or initialize global NLP processor instance."""
    global _nlp_processor
    if _nlp_processor is None:
        _nlp_processor = NLPProcessor()
    return _nlp_processor
