"""Test script for /api/apply-job endpoint - Run this to test the Apply button functionality."""

import requests
import json
from datetime import datetime

# Test data
test_candidate = {
    "jobId": "test_job_001",
    "jobTitle": "Senior Python Developer",
    "jobDescription": "Looking for an experienced Python developer with expertise in FastAPI, PostgreSQL, and cloud deployment. Must have 5+ years of experience.",
    "requiredSkills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
    "candidateId": "candidate_001",
    "candidateName": "John Doe",
    "candidateEmail": "john@example.com",
    "resumeText": "Experienced Python developer with 6 years of experience. Expert in FastAPI, PostgreSQL, Docker, and AWS. Built multiple microservices and deployed them on AWS.",
    "candidateSkills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "Kubernetes"]
}

def test_apply_endpoint():
    """Test the /api/apply-job endpoint."""
    url = "http://localhost:8000/api/apply-job"
    
    print("=" * 60)
    print("Testing /api/apply-job endpoint")
    print("=" * 60)
    print(f"\nURL: {url}")
    print(f"\nRequest Body:\n{json.dumps(test_candidate, indent=2)}")
    
    try:
        print("\n[*] Sending request...")
        response = requests.post(
            url,
            json=test_candidate,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"\n[✓] Response Status: {response.status_code}")
        print(f"[✓] Response Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"\n[✓] Response Body:\n{json.dumps(response_data, indent=2)}")
            
            if response.ok:
                print("\n[✓] SUCCESS - Application processed!")
                if 'data' in response_data:
                    data = response_data['data']
                    print(f"\nMatch Percentage: {data.get('matchPercentage', 'N/A')}%")
                    print(f"Matched Skills: {data.get('matched_skills', [])}")
                    print(f"Missing Skills: {data.get('missing_skills', [])}")
                    print(f"Improvements: {data.get('improvements', [])}")
            else:
                print("\n[✗] FAILED - Server returned error")
                print(f"Error: {response_data}")
        except json.JSONDecodeError:
            print(f"\n[✗] Could not parse response as JSON")
            print(f"Response text: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n[✗] CONNECTION ERROR")
        print("Make sure backend is running: python -m uvicorn backend_py.app:app --reload --port 8000")
    except requests.exceptions.Timeout:
        print("\n[✗] REQUEST TIMEOUT (30 seconds)")
        print("Backend might be slow loading NLP models on first request")
    except Exception as e:
        print(f"\n[✗] ERROR: {str(e)}")

if __name__ == "__main__":
    print("\nBackend Application Tester")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    test_apply_endpoint()
    print(f"\nCompleted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
