# Debug Guide - Apply Button Error

## Quick Debug Checklist

### 1. **Check if Backend is Running**
```bash
# Terminal 1 - Start backend
cd backend_py
python -m uvicorn app:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### 2. **Check Frontend Console for Errors**
```
1. Open browser: http://localhost:5173/jobs
2. Press F12 → Console tab
3. Click "Apply Now" button
4. Look for these logs:
   - "Applying with candidate data:"
   - "Request body:"
   - "Response status:"
   - "Response data:"
```

### 3. **Verify Backend Logs**
The backend terminal should show:
```
INFO: Processing job application for [CandidateName] - Job: [JobTitle]
```

## Common Issues & Fixes

### Issue: "Connection refused" in browser console
**Fix:** Backend not running
- Start backend: `python -m uvicorn backend_py.app:app --reload --port 8000`
- Wait for "Application startup complete"

### Issue: CORS error in browser console
**Fix:** CORS middleware not initialized
- Backend already has CORS configured
- Refresh browser: Ctrl+Shift+R

### Issue: "NLP processor error" in response
**Fix:** NLP model loading issue
- First request loads models (5-30 seconds)
- Check backend terminal for model loading messages
- Ensure sentence-transformers is installed: `pip install sentence-transformers`

### Issue: "Failed to process application" with no details
**Fix:** Missing candidate data
- Check browser console shows "Applying with candidate data:"
- Should have: name, email, resumeText, skills

### Issue: 404 error
**Fix:** Endpoint not found
- Verify backend route: `/api/apply-job` exists
- Check backend terminal shows route registration

## Test the Endpoint Directly

### Option 1: Use provided test script
```bash
# Terminal 3
python TEST_APPLY_ENDPOINT.py
```

This tests the backend without frontend issues.

### Option 2: Use curl
```bash
curl -X POST http://localhost:8000/api/apply-job \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "test_001",
    "jobTitle": "Python Developer",
    "jobDescription": "We need a Python expert",
    "requiredSkills": ["Python", "FastAPI"],
    "candidateId": "cand_001",
    "candidateName": "Test User",
    "candidateEmail": "test@example.com",
    "resumeText": "I have 5 years Python and FastAPI experience",
    "candidateSkills": ["Python", "FastAPI"]
  }'
```

### Option 3: Use VS Code REST Client extension
Create file `.rest`:
```
POST http://localhost:8000/api/apply-job
Content-Type: application/json

{
  "jobId": "test_001",
  "jobTitle": "Python Developer",
  "jobDescription": "We need a Python expert",
  "requiredSkills": ["Python", "FastAPI"],
  "candidateId": "cand_001",
  "candidateName": "Test User",
  "candidateEmail": "test@example.com",
  "resumeText": "I have 5 years Python and FastAPI experience",
  "candidateSkills": ["Python", "FastAPI"]
}
```

## Complete Flow Debugging

### Step 1: Terminal 1 - Start Backend with Verbose Logging
```bash
cd backend_py
python -m uvicorn app:app --reload --port 8000 --log-level debug
```

### Step 2: Terminal 2 - Start Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Browser Console
1. Open http://localhost:5173/jobs
2. Press F12 → Console tab
3. Click "Apply Now"
4. Copy all console output

### Step 4: Check Backend Terminal
Share the logs showing:
- Request received
- NLP processing
- Response sent

## What Each Log Message Means

| Message | Meaning |
|---------|---------|
| "Applying with candidate data:" | Frontend collected candidate info successfully |
| "Request body:" | Shows exact data being sent to backend |
| "Response status: 200" | Backend accepted request ✓ |
| "Response data:" | Shows match percentage and results |
| "error: Failed to process" | Backend returned error, check details |

## Network Debugging

Check network tab in browser:
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Apply Now"
4. Look for `apply-job` request
5. Check:
   - Status code (200 = good, others = error)
   - Request body (Headers tab)
   - Response (Response tab)

## Still Not Working?

Please provide:
1. Browser console output (F12 → Console tab)
2. Backend terminal logs
3. Network request details (F12 → Network tab → apply-job request → Response)
4. What error message appears on screen

## Files to Check

- Frontend: `frontend/src/pages/Jobs.jsx` (lines 30-90)
- Backend: `backend_py/app.py` (lines 934-1030)
- NLP: `backend_py/nlp_processor.py`
- Models: `backend_py/app.py` - ApplyJobRequest class (lines 45-56)
