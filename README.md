# Quickz – Resume Screening & Job Matching System

Quickz is a skill-based resume screening and job matching platform built to make the hiring process faster and more transparent. Instead of manually reviewing resumes, the system matches candidates and jobs using skills and eligibility percentage, helping both candidates and recruiters make better decisions.

## Solution Approach
Candidates register on the platform and upload their resume or profile details. The system extracts and stores candidate skills in the database. Recruiters create job postings with required and optional skills. When matching is triggered, the system compares candidate skills with job requirements and calculates an eligibility percentage. Missing skills are also identified to help candidates understand where they can improve.

## How it works
- Candidates sign up and upload their resume or profile details.
- Skills are stored and used for matching.
- Recruiters post jobs with required skills.
- The system compares skills and calculates an eligibility percentage.
- Candidates see matched jobs with missing skills.
- Recruiters see eligible and applied candidates and can download Excel reports.

## Features
- Candidate profile and resume upload
- Skill-based job matching with percentage score
- Apply for jobs and track applications
- Recruiter job posting and candidate matching
- Excel export of matched and applied candidates

## Dependencies / Prerequisites
- Python 3.8 or above
- Node.js (version 16 or above)
- npm
- MongoDB (MongoDB Compass or MongoDB Atlas)
- Git

## Setup & Installation

### Backend Setup
Navigate to the project root directory and start the FastAPI backend server:
cd "C:\Users\bhava\OneDrive\Documents\resume shortlister"
python -m uvicorn backend_py.app:app --reload --port 8000

The backend server will run at `http://localhost:8000`.

### Frontend Setup
Open a new terminal, navigate to the frontend folder, and start the React application:
cd "C:\Users\bhava\OneDrive\Documents\resume shortlister\frontend"
npm install
npm run dev

The frontend application will run at `http://localhost:5173`.


---

## Usage Guide

### For Candidates
1. Register and login
2. Upload resume and complete profile
3. View and edit profile anytime
4. Click **Find Match** to see eligible jobs
5. Apply for jobs
6. Track applications in **My Activities**

### For Recruiters
1. Register and login
2. Create job postings
3. View matched candidates
4. View applied candidates
5. Download Excel sheets for shortlisting

---

## UI / UX Highlights
- Clean and modern design
- Skill tags and progress indicators
- Role-based navigation
- Responsive layout
- Smooth transitions

---

## Security & Performance
- JWT-based authentication
- Role-based access control
- Secure API endpoints
- Optimized database queries

---

## Troubleshooting

- Backend not running: check Python version and port
- MongoDB error: verify connection string
- Frontend error: run `npm install`
- CORS issue: ensure backend is running on correct port

---

## Conclusion

Quickz simplifies hiring by focusing on skills, not just resumes.  
It empowers candidates with clarity and gives recruiters actionable insights, making hiring faster, smarter, and fairer.

Quickz – Resume Screening & Job Matching System
