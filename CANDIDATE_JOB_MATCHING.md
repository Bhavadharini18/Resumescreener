# Candidate Job Matching Feature

## Overview

The Candidate Job Matching feature allows candidates to enter their skills and discover jobs that match their profile. This mirrors the recruiter functionality and provides candidates with a comprehensive view of job opportunities based on their skill set.

## Features Implemented

### 1. Frontend Components

#### **CandidateJobMatching.jsx** (New Component)
- **Location:** `frontend/src/pages/CandidateJobMatching.jsx`
- **Purpose:** Main component for candidate job matching
- **Features:**
  - Skill input textarea for candidates to enter their skills (comma-separated)
  - "Find Matching Jobs" button to trigger matching algorithm
  - Display of matched jobs with match percentages
  - Skill comparison showing:
    - **✓ Matched Skills (Green):** Skills candidate has that job requires
    - **✗ Skills to Learn (Red):** Skills candidate doesn't have but job requires
    - **Required Skills (Blue):** All required skills for position
  - Match score breakdown showing:
    - Semantic Match % - Based on transformer embeddings
    - Skill Match % - Based on skill overlap

#### **CandidateDashboard.jsx** (Updated)
- **Purpose:** Main candidate dashboard
- **Changes:**
  - Integrated `CandidateJobMatching` component at the top
  - Organized sections for:
    1. Job Matching (primary feature)
    2. Resume Upload
    3. Applications & Shortlist
- **User Flow:** Candidates first see job matching, then can upload resumes

### 2. Backend API Endpoint

#### **POST /api/match-jobs**
- **Location:** `backend_py/app.py` (Line 353)
- **Purpose:** Match candidate skills against available jobs
- **Request Body:**
  ```json
  {
    "candidateSkills": ["Python", "React", "Node.js"],
    "resume": "Optional resume text for semantic matching"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "matches": [
        {
          "id": 1,
          "title": "Python Full Stack Developer",
          "company": "Tech Startup Inc.",
          "description": "Job description...",
          "requiredSkills": ["Python", "Django", "React", "PostgreSQL", "JavaScript"],
          "matchPercentage": 85.5,
          "matchedSkills": ["Python", "React"],
          "missingSkills": ["Django", "PostgreSQL", "JavaScript"],
          "semanticScore": 0.82,
          "skillScore": 0.4,
          "salary": "$80,000 - $120,000"
        }
      ],
      "jobSkills": ["Python", "React", "Node.js"],
      "totalMatches": 3,
      "totalJobs": 4,
      "matchingMethod": "NLP + Transformer Embeddings (0.7 semantic + 0.3 skill match)"
    }
  }
  ```

### 3. Styling

#### **New CSS Classes** (in `frontend/src/styles.css`)
- `.candidate-job-matching` - Main container with fade-in animation
- `.skills-input-section` - Skills textarea section styling
- `.skills-textarea` - Textarea for skill input with focus states
- `.info-text` - Skill count info display
- `.your-skills-section` - Blue highlighted section showing candidate's skills
- `.your-skill` - Individual skill tag (blue background)
- `.jobs-match-list` - Container for job match cards
- `.job-match-card` - Individual job match card with hover effects
- `.job-match-header` - Header section with job title and match badge
- `.job-description` - Job description text styling
- `.skills-section` - Container for skill categorization
- `.skill-tag.matched` - Green styled matched skills
- `.skill-tag.missing` - Red styled missing skills
- `.skill-tag.required` - Blue styled required skills
- `.match-details` - Score breakdown display
- `.score-item` - Individual score item styling
- `.job-meta` - Job metadata (company, salary, etc.)
- `.no-matches` - Message when no matching jobs found
- `.match-badge.match-high` - Green badge for 70%+ match
- `.match-badge.match-medium` - Yellow badge for 40-69% match
- `.match-badge.match-low` - Red badge for <40% match

### 4. Matching Algorithm

The matching algorithm combines two scoring methods:

#### **Semantic Score (70% weight)**
- Uses Sentence Transformers (all-MiniLM-L6-v2 model)
- Converts candidate skills and job description to embeddings
- Calculates cosine similarity between vectors
- Range: 0.0 to 1.0

#### **Skill Score (30% weight)**
- Direct comparison of candidate skills with required skills
- Identifies exact and partial matches
- Formula: `matched_skills / total_required_skills`
- Range: 0.0 to 1.0

#### **Final Match Percentage**
```
match_percentage = (0.7 × semantic_score + 0.3 × skill_score) × 100
```

### 5. Data Sources

#### **Job Data**
- **Primary Source:** Node.js backend `/api/jobs` endpoint (port 5000)
- **Fallback Sample Data:** If Node.js backend unavailable, uses 4 sample jobs:
  1. Python Full Stack Developer
  2. Frontend React Developer
  3. Node.js Backend Engineer
  4. Data Science Engineer

#### **Candidate Skills**
- Input directly by candidate in the textarea
- Comma-separated format
- Automatically trimmed and cleaned

### 6. User Experience Flow

1. **Candidate Dashboard Navigation**
   - Candidate logs in and navigates to "Candidate Dashboard"
   
2. **Skill Entry**
   - Candidate sees "Find Matching Jobs" section at top
   - Candidate enters their skills in textarea (comma-separated)
   - System displays skill count in real-time

3. **Job Matching**
   - Candidate clicks "Find Matching Jobs" button
   - System loads available jobs from backend
   - Matches each job against candidate skills using NLP

4. **Results Display**
   - Jobs sorted by match percentage (highest first)
   - Each job card shows:
     - Job title, company, description
     - Match percentage with color-coded badge
     - Candidate's matched skills (green ✓)
     - Missing skills to learn (red ✗)
     - All required skills for position (blue)
     - Semantic and skill match scores

5. **Skill Gap Analysis**
   - Candidate can easily see which skills they need to develop
   - Visual color coding helps prioritization:
     - **Green:** Ready to apply for jobs requiring these
     - **Red:** Need to learn these skills
     - **Blue:** Overview of all requirements

## Technical Integration

### Frontend to Backend Communication
```
1. User enters skills in textarea
2. Click "Find Matching Jobs"
3. POST http://localhost:8001/api/match-jobs
4. Backend processes request with NLP algorithms
5. Returns matched jobs with scores
6. Frontend displays results with styling
```

### Parallel Processing
- Backend fetches job data from Node.js backend (port 5000)
- Simultaneously generates embeddings for candidate
- Calculates similarity for each job
- Returns results ranked by match percentage

### Error Handling
- **No skills entered:** Shows error message "Please enter your skills first"
- **No jobs available:** Shows "No matching jobs found" message
- **Backend unavailable:** Falls back to sample jobs
- **NLP processing fails:** Falls back to simple skill matching

## Dependencies

### Frontend
- React 18+
- Fetch API for HTTP requests
- CSS Grid and Flexbox for styling

### Backend
- FastAPI
- sentence-transformers (all-MiniLM-L6-v2)
- numpy (for cosine similarity)
- pymongo (MongoDB connection)
- requests (for Node.js backend communication)

## Server Ports

| Service | Port | Status |
|---------|------|--------|
| FastAPI Backend (NLP) | 8001 | Running |
| Node.js Backend | 5000 | Running (Job data) |
| React Frontend | 5174 | Running |
| MongoDB | 27017 | Optional (fallback to sample data) |

## Testing Instructions

### 1. Start All Services
```bash
# Terminal 1: Start Python FastAPI backend
cd backend_py
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8001

# Terminal 2: Start Node.js backend (if not already running)
cd backend
npm start

# Terminal 3: Start React frontend
cd frontend
npm run dev
```

### 2. Access Application
- Open browser to `http://localhost:5174`
- Navigate to "Candidate Dashboard"
- Enter skills: `Python, React, JavaScript, MongoDB`
- Click "Find Matching Jobs"
- View matched jobs with percentages

### 3. Sample Test Scenarios

#### Test Case 1: Exact Skill Match
- Skills: `Python, Django, React, PostgreSQL, JavaScript`
- Expected: First job shows 100% match (all required skills present)

#### Test Case 2: Partial Match
- Skills: `Python, JavaScript`
- Expected: Multiple jobs shown with 40-60% match (missing several required skills)

#### Test Case 3: No Skills
- Click "Find Matching Jobs" with empty input
- Expected: Error message "Please enter your skills first"

#### Test Case 4: Semantic Matching
- Skills: `Web Development, Frontend, UI/UX`
- Expected: React/Frontend job shows high match despite no exact skill names

## Performance Characteristics

- **API Response Time:** ~500ms to 2s (includes job fetch + embedding generation + similarity calculation)
- **Number of Jobs Matched:** 4-10 (configurable, currently limited to available jobs)
- **Memory Usage:** ~200MB (loads sentence transformer model)
- **Embedding Dimensions:** 384 (all-MiniLM-L6-v2 output size)

## Future Enhancements

1. **Skill Proficiency Levels**
   - Allow candidates to specify skill levels (Junior, Intermediate, Expert)
   - Weight matching based on proficiency vs. job requirement

2. **Job Alerts**
   - Subscribe to jobs matching skill profile
   - Email notifications when new matching jobs posted

3. **Skill Development Recommendations**
   - Suggest courses/resources for missing skills
   - Track skill development over time

4. **Saved Searches**
   - Save favorite job matches
   - Track application history

5. **AI-Powered Resume Suggestions**
   - Recommend resume improvements for selected jobs
   - Highlight relevant experience

6. **Industry & Location Filtering**
   - Filter jobs by industry/location
   - Remote/on-site preferences

## API Documentation

### Request Format
```javascript
const request = {
  candidateSkills: ["Python", "React", "Node.js"],
  resume: "Optional: Full resume text for enhanced semantic matching"
}
```

### Response Format
```javascript
{
  success: true,
  data: {
    matches: [...], // Array of matched jobs
    jobSkills: [...], // Candidate's input skills
    totalMatches: 3, // Jobs with match % >= 40%
    totalJobs: 4, // Total jobs analyzed
    matchingMethod: "NLP + Transformer Embeddings..."
  }
}
```

## Troubleshooting

### "No matching jobs found"
- Check if Node.js backend is running on port 5000
- Verify job data in MongoDB or Node.js backend
- Check browser console for API errors

### Low match percentages
- Add more specific skills
- Ensure skills match industry terminology
- Consider adding resume text for semantic matching

### Backend errors
- Verify Python environment has all dependencies: `pip install fastapi sentence-transformers numpy pymongo requests`
- Check if port 8001 is available
- Monitor backend logs for detailed error messages

---

## Summary

The Candidate Job Matching feature provides a symmetrical experience to the recruiter functionality. Candidates can now:
- ✅ Enter their skills
- ✅ Discover matching job opportunities
- ✅ See detailed skill gap analysis
- ✅ Understand job requirements with visual indicators
- ✅ Make informed career decisions based on match percentages

This feature completes the two-way matching system, making the application a comprehensive platform for both recruiters and candidates.
