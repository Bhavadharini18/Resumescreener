import React, { useEffect, useState } from 'react'
import Shortlist from '../components/Shortlist'

export default function RecruiterDashboard(){
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [showMatches, setShowMatches] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [extractedSkills, setExtractedSkills] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [appliedCandidates, setAppliedCandidates] = useState([])
  const [showApplicants, setShowApplicants] = useState(false)

  const updateCandidateStatus = async (candidateEmail, jobId, newStatus) => {
    try {
      const response = await fetch('http://localhost:8000/api/update-application-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateEmail: candidateEmail,
          jobId: jobId,
          status: newStatus
        })
      })

      if (response.ok) {
        // Refresh the matched candidates list to show updated status
        if (selectedJob) {
          findMatches(selectedJob)
        }
      } else {
        setError('Failed to update status')
      }
    } catch (err) {
      setError('Error updating status: ' + err.message)
    }
  }

  useEffect(() => {
    // Get current recruiter from session
    const user = JSON.parse(localStorage.getItem('quickz_session') || 'null')
    setCurrentUser(user)
    
    fetch('http://localhost:5000/api/jobs')
      .then(r => r.json())
      .then(jobs => {
        // Filter jobs by current recruiter's email
        const filtered = jobs.filter(j => j.createdBy === user?.email)
        setJobs(filtered)
      })
      .catch(() => setJobs([]))
  }, [])

  const findMatches = async () => {
    if (!selectedJob) {
      setError('Please select a job first')
      return
    }

    setLoading(true)
    setError(null)
    setCandidates([])

    try {
      // Fetch applied candidates for the selected job
      const response = await fetch(`http://localhost:8000/api/job-applications/${selectedJob._id || selectedJob.id}`)
      const data = await response.json()
      
      if (!response.ok || !data.data) {
        setError('No applications found for this job')
        setCandidates([])
        setShowMatches(true)
        setLoading(false)
        return
      }

      // Use applied candidates as the list; they already have match scores
      const sortedCandidates = data.data.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0))
      
      setCandidates(sortedCandidates)
      setShowMatches(true)
      setError(null)
    } catch (err) {
      setError('Error fetching applied candidates: ' + err.message)
      setCandidates([])
      setShowMatches(true)
    }

    setLoading(false)
  }

  const exportToExcel = async () => {
    if (!selectedJob || !candidates.length) {
      setError('No candidates to export')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/export-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidates: candidates,
          jobTitle: selectedJob.title,
          company: selectedJob.company
        })
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error('Export error response:', errText)
        throw new Error(`Export failed: ${response.status} ${errText}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedJob.title.replace(/\s+/g, '_')}_candidates.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export exception:', err)
      setError('Export failed: ' + err.message)
    }
  }

  const handleViewApplicants = async (job) => {
    setSelectedJob(job)
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/job-applications/${job._id || job.id}`)
      const data = await response.json()
      if (data.data) {
        setAppliedCandidates(data.data)
      } else {
        setAppliedCandidates([])
      }
      setShowApplicants(true)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setAppliedCandidates([])
      setShowApplicants(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="recruiter-dashboard">
      <h2>Recruiter Dashboard</h2>
      <p>Manage jobs and find matching candidates using AI algorithms.</p>

      {/* Jobs Section */}
      <section className="dashboard-section">
        <h3>Your Posted Jobs</h3>
        <div className="jobs-grid">
          {jobs.length === 0 ? (
            <p className="muted">You haven't posted any jobs yet.</p>
          ) : (
            jobs.map(j => (
              <div 
                key={j._id} 
                className={`job-card ${selectedJob?._id === j._id ? 'selected' : ''}`}
              >
                <h4>{j.title}</h4>
                <div className="muted">{j.company}</div>
                <p>{j.description}</p>
                <div className="skills">{(j.requiredSkills || []).join(', ')}</div>
                <button
                  onClick={() => handleViewApplicants(j)}
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  👥 View Applicants
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Match Finder Section */}
      <section className="dashboard-section">
        <div className="match-header">
          <h3>Find Resume Matches</h3>
          {selectedJob && (
            <div className="selected-job-info">
              <strong>Selected Job:</strong> {selectedJob.title} at {selectedJob.company}
            </div>
          )}
        </div>
        <div style={{marginBottom: '15px'}}>
          <label htmlFor="jobSelect" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Select Job:</label>
          <select 
            id="jobSelect"
            value={selectedJob?._id || selectedJob?.id || ''}
            onChange={(e) => {
              const job = jobs.find(j => (j._id || j.id) === e.target.value)
              setSelectedJob(job || null)
            }}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
          >
            <option value="">-- Choose a job --</option>
            {jobs.map(j => (
              <option key={j._id || j.id} value={j._id || j.id}>
                {j.title} at {j.company}
              </option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-primary btn-lg"
          onClick={findMatches}
          disabled={!selectedJob || loading}
        >
          {loading ? 'Finding Matches...' : 'Find Resume Matches'}
        </button>
      </section>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Matched Candidates Section */}
      {showMatches && (
        <section className="dashboard-section">
          <h3>Skill Matching Analysis</h3>
          
          {/* Required Skills Display */}
          {extractedSkills.length > 0 && (
            <div className="required-skills-section">
              <strong>Required Skills for {selectedJob?.title || 'Position'}:</strong>
              <div className="skills-list">
                {extractedSkills.map((skill, i) => (
                  <span key={i} className="skill-tag required">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <h3>Matched Candidates {candidates.length > 0 && `(${candidates.length})`}</h3>
          {candidates.length === 0 ? (
            <div className="no-matches">
              <p className="muted">No matches found</p>
            </div>
          ) : (
            <>
              <div className="export-section">
                <button className="btn" onClick={exportToExcel}>
                  📥 Export to Excel
                </button>
              </div>
              <div className="candidates-list">
                {candidates.map((candidate, idx) => (
                  <div key={idx} className="candidate-card">
                    <div className="candidate-header">
                      <div>
                        <h4>{candidate.candidateName}</h4>
                        <p className="muted">{candidate.candidateEmail}</p>
                      </div>
                      <div className={`match-badge match-${candidate.matchPercentage >= 70 ? 'high' : candidate.matchPercentage >= 40 ? 'medium' : 'low'}`}>
                        {Math.round(candidate.matchPercentage || 0)}%
                      </div>
                    </div>
                    
                    {/* Candidate Basic Information */}
                    <div className="candidate-details">
                      <div className="detail-item">
                        <strong>📧 Email:</strong> {candidate.candidateEmail || 'N/A'}
                      </div>
                      <div className="detail-item">
                        <strong>📞 Phone:</strong> {candidate.phone || 'N/A'}
                      </div>
                      <div className="detail-item">
                        <strong>💼 Experience:</strong> {candidate.experience || 'N/A'}
                      </div>
                    </div>
                    
                    {/* Skill Comparison */}
                    <div className="skills-comparison">
                      <h5>✅ Matched Skills:</h5>
                      <div className="skills-list">
                        {candidate.matchedSkills && candidate.matchedSkills.length > 0 ? (
                          candidate.matchedSkills.map((skill, i) => (
                            <span key={i} className="skill-tag required">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="muted">No matched skills</span>
                        )}
                      </div>
                    </div>

                    <div className="skills-comparison">
                      <h5>❌ Missing Skills:</h5>
                      <div className="skills-list">
                        {candidate.missingSkills && candidate.missingSkills.length > 0 ? (
                          candidate.missingSkills.map((skill, i) => (
                            <span key={i} className="skill-tag missing">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="muted">All required skills matched</span>
                        )}
                      </div>
                    </div>

                    {/* Match Details */}
                    {candidate.semanticScore !== undefined && (
                      <div className="match-details">
                        <div className="score-item">
                          <strong>🧠 Semantic Relevance:</strong> {(candidate.semanticScore * 100).toFixed(1)}%
                        </div>
                        <div className="score-item">
                          <strong>🎯 Skill Match Score:</strong> {(candidate.skillScore * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}
                    
                    {/* Overall Match Score */}
                    <div className="overall-score">
                      <strong>Overall Match Score: {Math.round(candidate.matchPercentage || 0)}%</strong>
                      <div className="score-bar">
                        <div className="score-fill" style={{width: `${candidate.matchPercentage || 0}%`}}></div>
                      </div>
                    </div>

                    {/* Status Update Actions */}
                    <div className="status-actions">
                      <strong>Current Status: <span className={`status-badge status-${candidate.status?.replace('_', '-') || 'applied'}`}>
                        {candidate.status ? candidate.status.replace('_', ' ').toUpperCase() : 'APPLIED'}
                      </span></strong>
                      <div className="status-buttons">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => updateCandidateStatus(candidate.candidateEmail, selectedJob.id || selectedJob._id, 'under_review')}
                        >
                          Under Review
                        </button>
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => updateCandidateStatus(candidate.candidateEmail, selectedJob.id || selectedJob._id, 'shortlisted')}
                        >
                          Shortlist
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => updateCandidateStatus(candidate.candidateEmail, selectedJob.id || selectedJob._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Applicants Modal */}
      {showApplicants && (
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
            <h3>👥 Applicants for {selectedJob?.title}</h3>
            
            {!appliedCandidates || appliedCandidates.length === 0 ? (
              <p style={{textAlign: 'center', color: '#999', padding: '40px 0'}}>No applications yet</p>
            ) : (
              <div style={{marginBottom: '20px'}}>
                {appliedCandidates.map((candidate, idx) => {
                  const matchPercentage = candidate.matchPercentage || 0
                  const matchColor = matchPercentage >= 75 ? '#4CAF50' : matchPercentage >= 50 ? '#FFC107' : '#f44336'
                  
                  return (
                    <div 
                      key={idx}
                      style={{
                        border: `2px solid ${matchColor}`,
                        borderRadius: '8px',
                        padding: '15px',
                        marginBottom: '15px',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px'}}>
                        <div>
                          <h4 style={{margin: '0 0 4px 0', color: '#333'}}>{candidate.candidateName}</h4>
                          <p style={{margin: '0', color: '#666', fontSize: '13px'}}>{candidate.candidateEmail}</p>
                        </div>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: matchColor,
                          textAlign: 'right'
                        }}>
                          {matchPercentage.toFixed(1)}%
                        </div>
                      </div>

                      {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                        <div style={{marginBottom: '10px'}}>
                          <div style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>✓ Matched Skills:</div>
                          <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                            {candidate.matchedSkills.map((skill, i) => (
                              <span 
                                key={i}
                                style={{
                                  backgroundColor: '#c8e6c9',
                                  color: '#2e7d32',
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px'
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {candidate.missingSkills && candidate.missingSkills.length > 0 && (
                        <div style={{marginBottom: '10px'}}>
                          <div style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>✗ Missing Skills:</div>
                          <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                            {candidate.missingSkills.map((skill, i) => (
                              <span 
                                key={i}
                                style={{
                                  backgroundColor: '#ffcdd2',
                                  color: '#c62828',
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px'
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {candidate.appliedAt && (
                        <div style={{fontSize: '12px', color: '#999', marginTop: '10px', borderTop: '1px solid #ddd', paddingTop: '10px'}}>
                          Applied: {new Date(candidate.appliedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <button 
              onClick={() => {
                setShowApplicants(false)
                setSelectedJob(null)
                setAppliedCandidates([])
              }}
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
        </div>
      )}

      {/* Applications & Shortlist Section */}
      <hr />
      <section className="dashboard-section">
        <h3>Applications & Shortlist</h3>
        <Shortlist />
      </section>    </div>
  )
}

