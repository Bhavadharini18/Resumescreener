import React, { useEffect, useState } from 'react'

export default function Jobs(){
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [applicationResult, setApplicationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [candidateData, setCandidateData] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [appliedCandidates, setAppliedCandidates] = useState({})

  useEffect(()=>{
    // Get current user from session
    const user = JSON.parse(localStorage.getItem('quickz_session') || 'null')
    setCurrentUser(user)
    
    fetch('http://localhost:5000/api/jobs').then(r=>r.json()).then(setJobs).catch(()=>setJobs([]))
  },[])

  const handleApply = async (job) => {
    setSelectedJob(job)
    setLoading(true)
    
    try {
      // Get candidate info from localStorage or fetch latest uploaded candidate
      let candidateInfo = JSON.parse(localStorage.getItem('candidateData')) || {}
      
      if (!candidateInfo.resumeText || !candidateInfo.skills) {
        // Fetch latest candidate from backend
        try {
          const response = await fetch('http://localhost:8000/api/latest-candidate')
          const data = await response.json()
          if (data.data) {
            candidateInfo = data.data
            setCandidateData(candidateInfo)
          }
        } catch (err) {
          console.warn('Could not fetch candidate:', err)
        }
      }

      // Ensure we have some data
      if (!candidateInfo.name) {
        candidateInfo.name = 'Candidate'
      }
      if (!candidateInfo.email) {
        candidateInfo.email = 'candidate@example.com'
      }
      if (!candidateInfo.resumeText) {
        candidateInfo.resumeText = candidateInfo.skills ? `Skills: ${candidateInfo.skills.join(', ')}` : 'No resume provided'
      }
      if (!candidateInfo.skills) {
        candidateInfo.skills = []
      }

      console.log('Applying with candidate data:', candidateInfo)

      // Apply for job with NLP matching
      const requestBody = {
        jobId: job._id || job.id || 'job_' + Date.now(),
        jobTitle: job.title,
        jobDescription: job.description,
        requiredSkills: job.requiredSkills || [],
        candidateId: candidateInfo.id || 'candidate_' + Date.now(),
        candidateName: candidateInfo.name,
        candidateEmail: candidateInfo.email,
        resumeText: candidateInfo.resumeText,
        candidateSkills: candidateInfo.skills || []
      }

      console.log('Request body:', requestBody)

      const response = await fetch('http://localhost:8000/api/apply-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok || data.data) {
        setApplicationResult(data.data || data)
      } else {
        setApplicationResult({
          error: data.detail || data.error_message || 'Failed to process application',
          details: data.details || JSON.stringify(data)
        })
      }
    } catch (error) {
      console.error('Application error:', error)
      setApplicationResult({
        error: 'Failed to process application',
        details: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewApplicants = async (job) => {
    try {
      const response = await fetch(`http://localhost:8000/api/job-applications/${job._id || job.id}`)
      const data = await response.json()
      setSelectedJob(job)
      setAppliedCandidates(data.data || [])
    } catch (error) {
      console.error('Error fetching applicants:', error)
      setAppliedCandidates([])
    }
  }

  const isRecruiterViewingOwnJob = (job) => {
    return currentUser?.email && job?.createdBy && currentUser.email === job.createdBy
  }

  return (
    <div>
      <h2>Jobs</h2>
      <div className="jobs-grid">
        {jobs.map(j=> (
          <div key={j._id} className="job-card">
            <h3>{j.title}</h3>
            <div className="muted">{j.company}</div>
            <p>{j.description}</p>
            <div className="skills">{(j.requiredSkills||[]).join(', ')}</div>
            
            {isRecruiterViewingOwnJob(j) ? (
              <button 
                onClick={() => handleViewApplicants(j)}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                👥 View Applicants
              </button>
            ) : !currentUser && (
              <button 
                onClick={() => handleApply(j)}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Apply Now
              </button>
            )}
          </div>
        ))}
        {jobs.length===0 && <div>No jobs yet</div>}
      </div>

      {/* Application Modal */}
      {(selectedJob || applicationResult) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '700px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            {/* Recruiter View - Show Applicants */}
            {isRecruiterViewingOwnJob(selectedJob) ? (
              <div>
                <h3>👥 Applicants for {selectedJob?.title}</h3>
                {!appliedCandidates || appliedCandidates.length === 0 ? (
                  <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                    <p>No applications yet</p>
                  </div>
                ) : (
                  <div>
                    {appliedCandidates.map((candidate, idx) => {
                      const matchColor = candidate.matchPercentage >= 75 ? '#4CAF50' : candidate.matchPercentage >= 50 ? '#FFC107' : '#f44336'
                      return (
                        <div key={idx} style={{
                          padding: '15px',
                          marginBottom: '15px',
                          border: `2px solid ${matchColor}`,
                          borderRadius: '8px',
                          backgroundColor: '#f9f9f9'
                        }}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px'}}>
                            <div>
                              <h4 style={{margin: '0 0 5px 0'}}>{candidate.candidateName}</h4>
                              <div style={{fontSize: '13px', color: '#666'}}>{candidate.candidateEmail}</div>
                            </div>
                            <div style={{
                              fontSize: '24px',
                              fontWeight: 'bold',
                              color: matchColor,
                              textAlign: 'center'
                            }}>
                              {candidate.matchPercentage.toFixed(1)}%
                            </div>
                          </div>
                          
                          {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                            <div style={{marginBottom: '10px'}}>
                              <div style={{fontSize: '12px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '5px'}}>✓ Matched Skills</div>
                              <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                                {candidate.matchedSkills.map((skill, i) => (
                                  <span key={i} style={{
                                    backgroundColor: '#c8e6c9',
                                    color: '#2e7d32',
                                    padding: '4px 10px',
                                    borderRadius: '15px',
                                    fontSize: '12px'
                                  }}>
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {candidate.missingSkills && candidate.missingSkills.length > 0 && (
                            <div style={{marginBottom: '10px'}}>
                              <div style={{fontSize: '12px', fontWeight: 'bold', color: '#f44336', marginBottom: '5px'}}>✗ Missing Skills</div>
                              <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                                {candidate.missingSkills.map((skill, i) => (
                                  <span key={i} style={{
                                    backgroundColor: '#ffcdd2',
                                    color: '#c62828',
                                    padding: '4px 10px',
                                    borderRadius: '15px',
                                    fontSize: '12px'
                                  }}>
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div style={{fontSize: '12px', color: '#999', marginTop: '10px'}}>
                            Applied: {new Date(candidate.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <button 
                  onClick={() => {
                    setSelectedJob(null)
                    setAppliedCandidates({})
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '100%',
                    marginTop: '15px'
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              // Candidate View - Show Application Results
              <>
                {loading ? (
                  <div style={{textAlign: 'center', padding: '40px'}}>
                    <div style={{fontSize: '18px', color: '#666'}}>Processing your application...</div>
                  </div>
                ) : applicationResult && !applicationResult.error ? (
                  <ApplicationResults 
                    result={applicationResult}
                    job={selectedJob}
                    onClose={() => {
                      setApplicationResult(null)
                      setSelectedJob(null)
                    }}
                  />
                ) : (
                  <div>
                    <h3>Application Error</h3>
                    <p>{applicationResult?.error || 'Something went wrong'}</p>
                    <button 
                      onClick={() => {
                        setApplicationResult(null)
                        setSelectedJob(null)
                      }}
                      style={{padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    >
                      Close
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ApplicationResults({ result, job, onClose }) {
  const matchPercentage = result.matchPercentage || result.match_percentage || 0
  const matchColor = matchPercentage >= 75 ? '#4CAF50' : matchPercentage >= 50 ? '#FFC107' : '#f44336'

  return (
    <div>
      <h3>Application Results for {job?.title}</h3>
      
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: `3px solid ${matchColor}`
      }}>
        <div style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
          Resume Match Percentage
        </div>
        <div style={{fontSize: '32px', fontWeight: 'bold', color: matchColor}}>
          {matchPercentage.toFixed(1)}%
        </div>
        <div style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>
          {matchPercentage >= 75 ? '✓ Excellent Match!' : matchPercentage >= 50 ? '◐ Good Match' : '✗ Needs Improvement'}
        </div>
      </div>

      {(result.matched_skills || result.matchedSkills) && (result.matched_skills || result.matchedSkills).length > 0 && (
        <div style={{marginBottom: '20px'}}>
          <h4 style={{color: '#4CAF50', marginBottom: '10px'}}>✓ Your Matching Skills</h4>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
            {(result.matched_skills || result.matchedSkills).map((skill, i) => (
              <span 
                key={i}
                style={{
                  backgroundColor: '#c8e6c9',
                  color: '#2e7d32',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {(result.missing_skills || result.missingSkills) && (result.missing_skills || result.missingSkills).length > 0 && (
        <div style={{marginBottom: '20px'}}>
          <h4 style={{color: '#f44336', marginBottom: '10px'}}>✗ Missing Skills</h4>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
            {(result.missing_skills || result.missingSkills).map((skill, i) => (
              <span 
                key={i}
                style={{
                  backgroundColor: '#ffcdd2',
                  color: '#c62828',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {(result.improvements || result.suggestions) && (result.improvements || result.suggestions).length > 0 && (
        <div style={{marginBottom: '20px'}}>
          <h4 style={{color: '#1976d2', marginBottom: '10px'}}>💡 Skills to Improve for This Role</h4>
          <ul style={{paddingLeft: '20px', lineHeight: '1.8', color: '#333'}}>
            {(result.improvements || result.suggestions).map((item, i) => (
              <li key={i} style={{marginBottom: '10px'}}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.semantic_score !== undefined && (
        <div style={{
          backgroundColor: '#f0f0f0',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '13px'
        }}>
          <div style={{marginBottom: '8px'}}>
            <strong>Semantic Match (Content Relevancy):</strong> {((result.semantic_score || 0) * 100).toFixed(1)}%
          </div>
          <div>
            <strong>Skill Match:</strong> {((result.skill_score || 0) * 100).toFixed(1)}%
          </div>
        </div>
      )}

      <button 
        onClick={onClose}
        style={{
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          width: '100%'
        }}
      >
        Close
      </button>
    </div>
  )
}
