"""
Test script to verify NLP-based skill matching is working correctly
"""

import requests
import json
import time

# Wait for server to fully startup
print("Waiting for server to fully startup...")
time.sleep(5)

BASE_URL = "http://localhost:8001"

# Test 1: Match candidates for a Python job
print("\n" + "="*80)
print("TEST 1: Match Candidates for Python Full Stack Developer Position")
print("="*80)

job_data = {
    "jobDescription": "We are looking for a Python full stack developer with expertise in Django, Flask, React, Node.js and PostgreSQL. Must have 5+ years of experience building web applications.",
    "requiredSkills": ["Python", "Django", "Flask", "React", "Node.js", "PostgreSQL", "JavaScript"],
    "jobTitle": "Python Full Stack Developer",
    "company": "Tech Startup"
}

try:
    response = requests.post(f"{BASE_URL}/api/match-candidates", json=job_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\nMatching Method: {result['data']['matchingMethod']}")
        print(f"Total Matches: {result['data']['totalMatches']}")
        print(f"Required Skills Extracted: {result['data']['requiredSkills']}")
        
        print("\nCandidate Matches:")
        for i, candidate in enumerate(result['data']['matches'], 1):
            print(f"\n  {i}. {candidate['name']} ({candidate['experience']})")
            print(f"     Match: {candidate['matchPercentage']}%")
            print(f"     Matched Skills: {candidate['matchedSkills']}")
            print(f"     Missing Skills: {candidate['missingSkills']}")
            print(f"     Semantic Score: {candidate['semanticScore']*100:.1f}%")
            print(f"     Skill Match Score: {candidate['skillScore']*100:.1f}%")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")

# Test 2: Match jobs for a candidate
print("\n" + "="*80)
print("TEST 2: Match Jobs for Candidate with Python, React, Node.js Skills")
print("="*80)

candidate_data = {
    "candidateSkills": ["Python", "React", "Node.js", "JavaScript", "MongoDB"]
}

try:
    response = requests.post(f"{BASE_URL}/api/match-jobs", json=candidate_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\nMatching Method: {result['data']['matchingMethod']}")
        print(f"Total Job Matches: {result['data']['totalMatches']}")
        print(f"Candidate Skills: {result['data']['jobSkills']}")
        
        print("\nJob Matches:")
        for i, job in enumerate(result['data']['matches'], 1):
            print(f"\n  {i}. {job['title']} at {job['company']}")
            print(f"     Match: {job['matchPercentage']}%")
            print(f"     Required Skills: {job['requiredSkills']}")
            print(f"     Matched Skills: {job['matchedSkills']}")
            print(f"     Missing Skills: {job['missingSkills']}")
            print(f"     Salary: {job['salary']}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")

print("\n" + "="*80)
print("Testing complete!")
print("="*80)
