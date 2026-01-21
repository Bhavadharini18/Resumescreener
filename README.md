Resume Screening and Skill Matching System

An AI-powered application that automatically screens resumes and ranks candidates based on how well they match a given job description using Natural Language Processing (NLP) and semantic similarity.

Problem Statement

Recruiters often receive hundreds of resumes for a single job role. Manual screening is time-consuming, inconsistent, and prone to bias. Traditional keyword-based filtering systems fail to accurately capture the relevance of a candidate’s skills and experience.

Solution

This project uses NLP-based semantic analysis to intelligently match resumes with job descriptions. Instead of relying on exact keyword matching, the system understands the meaning of text, evaluates skill relevance, and produces ranked, explainable candidate results to support fair and efficient hiring decisions.

Key Features

Upload multiple resumes in PDF or DOCX format

Input job description text

Semantic resume and job matching using embeddings

Skill extraction and skill gap analysis

Candidate ranking with match scores

Explainable results for each candidate

MongoDB-based data storage

Simple and clean frontend interface

Tech Stack

Frontend

React.js or Streamlit

HTML, CSS, Bootstrap

Backend

FastAPI (Python)

REST APIs

AI and NLP

Sentence Transformers (all-MiniLM-L6-v2)

SpaCy

Scikit-learn (cosine similarity)

Database

MongoDB (MongoDB Compass)

System Architecture

Frontend (React or Streamlit)
→ FastAPI Backend
→ NLP Processing and Scoring Engine
→ MongoDB Database
→ Ranked Candidate Results

Matching Logic

The final match score is calculated using a weighted approach:

Final Score =
0.7 × Semantic Similarity + 0.3 × Skill Match Score

Candidates are ranked based on this score.

How It Works

User uploads resumes and enters a job description

Resume text is extracted and preprocessed

Semantic embeddings are generated for resumes and job description

Cosine similarity is computed

Skills are extracted and compared

Candidates are ranked and displayed with explanations

How to Run the Project

Backend setup:

pip install fastapi uvicorn pymongo sentence-transformers spacy scikit-learn
uvicorn main:app --reload

Frontend setup:

npm install
npm start

Or using Streamlit:

streamlit run app.py

Use Cases

Automated resume screening

Skill-based candidate shortlisting

Fair and explainable hiring systems

Recruitment analytics and decision support
