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

  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then(r => r.json())
      .then(setJobs)
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
      // Call backend API to get matched candidates using Python NLP algorithms
      const response = await fetch('http://localhost:8001/api/match-candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: selectedJob.description,
          requiredSkills: selectedJob.requiredSkills || [],
          jobTitle: selectedJob.title,
          company: selectedJob.company
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.matches || data.matches.length === 0) {
        setError('No matches found')
        setCandidates([])
        setShowMatches(true)
        setLoading(false)
        return
      }

      // Extract required skills from response or use job skills
      const requiredSkills = data.requiredSkills || selectedJob.requiredSkills || []
      setExtractedSkills(requiredSkills)

      // Sort by match percentage
      const sortedMatches = data.matches.sort((a, b) => b.matchPercentage - a.matchPercentage)
      
      setCandidates(sortedMatches)
      setShowMatches(true)
      setError(null)
    } catch (err) {
      setError('Error finding matches: ' + err.message)
      setCandidates([])
      setShowMatches(true)
    }

    setLoading(false)
  }

  return (
    <div className="recruiter-dashboard">
      <h2>Recruiter Dashboard</h2>
      <p>Manage jobs and find matching candidates using AI algorithms.</p>

      {/* Jobs Section */}
      <section className="dashboard-section">
        <h3>Available Jobs</h3>
        <div className="jobs-grid">
          {jobs.length === 0 ? (
            <p className="muted">No jobs available. Create one first.</p>
          ) : (
            jobs.map(j => (
              <div 
                key={j._id} 
                className={`job-card ${selectedJob?._id === j._id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedJob(j)
                  setShowMatches(false)
                  setCandidates([])
                  setError(null)
                }}
              >
                <h4>{j.title}</h4>
                <div className="muted">{j.company}</div>
                <p>{j.description}</p>
                <div className="skills">{(j.requiredSkills || []).join(', ')}</div>
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
            <div className="candidates-list">
              {candidates.map((candidate, idx) => (
                <div key={idx} className="candidate-card">
                  <div className="candidate-header">
                    <div>
                      <h4>{candidate.name}</h4>
                      <p className="muted">{candidate.email}</p>
                    </div>
                    <div className={`match-badge match-${candidate.matchPercentage >= 70 ? 'high' : candidate.matchPercentage >= 40 ? 'medium' : 'low'}`}>
                      {Math.round(candidate.matchPercentage)}%
                    </div>
                  </div>
                  
                  {/* Candidate Basic Information */}
                  <div className="candidate-details">
                    <div className="detail-item">
                      <strong>📧 Email:</strong> {candidate.email || 'N/A'}
                    </div>
                    <div className="detail-item">
                      <strong>📞 Phone:</strong> {candidate.phone || 'N/A'}
                    </div>
                    <div className="detail-item">
                      <strong>💼 Experience:</strong> {candidate.experience || 'N/A'}
                    </div>
                  </div>
                  
                  {/* All Candidate Skills Database */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="skills-section">
                      <strong>💾 Database Skills ({candidate.skills.length}):</strong>
                      <div className="skills-list">
                        {candidate.skills.map((skill, i) => (
                          <span 
                            key={i} 
                            className={`skill-tag ${
                              candidate.matchedSkills?.includes(skill) ? 'matched' : 'extra'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Skill Comparison */}
                  <div className="skill-comparison">
                    {/* Matched Skills */}
                    {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                      <div className="skills-section">
                        <strong>✓ Matched Skills ({candidate.matchedSkills.length}):</strong>
                        <div className="skills-list">
                          {candidate.matchedSkills.map((skill, i) => (
                            <span key={i} className="skill-tag matched">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Missing Skills */}
                    {candidate.missingSkills && candidate.missingSkills.length > 0 && (
                      <div className="skills-section">
                        <strong>✗ Missing Skills ({candidate.missingSkills.length}):</strong>
                        <div className="skills-list">
                          {candidate.missingSkills.map((skill, i) => (
                            <span key={i} className="skill-tag missing">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                    <strong>Overall Match Score: {Math.round(candidate.matchPercentage)}%</strong>
                    <div className="score-bar">
                      <div className="score-fill" style={{width: `${candidate.matchPercentage}%`}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      {/* Applications & Shortlist Section */}
      <hr />
      <section className="dashboard-section">
        <h3>Applications & Shortlist</h3>
        <Shortlist />
      </section>    </div>
  )
}

