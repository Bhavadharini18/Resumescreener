import React, { useEffect, useState } from 'react'
import { currentUser } from '../utils/auth'

export default function CandidateJobMatching(){
  const [jobs, setJobs] = useState([])
  const [matchedJobs, setMatchedJobs] = useState([])
  const [candidateSkills, setCandidateSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showMatches, setShowMatches] = useState(false)
  const [extractedSkills, setExtractedSkills] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loggedInUser = currentUser()
    setUser(loggedInUser)
    
    if (loggedInUser && loggedInUser.role === 'candidate') {
      fetchCandidateData(loggedInUser.email)
    }
    
    fetchJobs()
  }, [])

  const fetchCandidateData = async (emailOverride) => {
    try {
      const emailParam = emailOverride || user?.email
        ? `?email=${encodeURIComponent(emailOverride || user.email)}`
        : ''
      const response = await fetch(`http://localhost:8000/api/latest-candidate${emailParam}`)
      if (response.ok) {
        const result = await response.json()
        if (result.status === 'success' && result.data.skills) {
          setCandidateSkills(result.data.skills)
        }
      }
    } catch (err) {
      console.error('Error fetching candidate data:', err)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/explore-jobs')
      if (response.ok) {
        const result = await response.json()
        if (result.status === 'success') {
          setJobs(result.data.jobs || [])
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setJobs([])
    }
  }

  const handleFindMatches = async () => {
    if (!user || user.role !== 'candidate') {
      setError('Please log in as a candidate to find matches')
      return
    }

    if (!candidateSkills || candidateSkills.length === 0) {
      setError('No skills found in your profile. Please create your profile first.')
      return
    }

    setLoading(true)
    setError(null)
    setMatchedJobs([])

    try {
      const response = await fetch('http://localhost:8000/api/match-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateSkills: candidateSkills,
          resume: candidateSkills.join(' ')
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.matches || data.matches.length === 0) {
        setError('No matching jobs found')
        setMatchedJobs([])
        setShowMatches(true)
        setLoading(false)
        return
      }

      const allJobSkills = data.jobSkills || []
      setExtractedSkills(allJobSkills)

      const sortedMatches = data.matches.sort((a, b) => b.matchPercentage - a.matchPercentage)
      
      setMatchedJobs(sortedMatches)
      setShowMatches(true)
      setError(null)
    } catch (err) {
      setError('Error finding matches: ' + err.message)
      setMatchedJobs([])
      setShowMatches(true)
    }

    setLoading(false)
  }

  return (
    <div className="candidate-job-matching">
      <h2>Find Matching Jobs</h2>
      <p>Discover jobs that match your profile based on your resume skills.</p>

      {!user || user.role !== 'candidate' ? (
        <div className="auth-required">
          <p>Please log in as a candidate to use this feature.</p>
        </div>
      ) : (
        <>
          {/* Candidate Skills Display Section */}
          <section className="dashboard-section">
            <h3>Your Profile Skills</h3>
            <div className="skills-display-section">
              {candidateSkills.length > 0 ? (
                <>
                  <div className="skills-list">
                    {candidateSkills.map((skill, i) => (
                      <span key={i} className="skill-tag your-skill">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="info-text">
                    Found <strong>{candidateSkills.length}</strong> skill{candidateSkills.length !== 1 ? 's' : ''} in your profile
                  </p>
                </>
              ) : (
                <div className="no-skills-message">
                  <p>No skills found in your profile. Please <a href="/profile">create your profile</a> first.</p>
                </div>
              )}
            </div>

            <button 
              className="btn btn-primary btn-lg"
              onClick={handleFindMatches}
              disabled={candidateSkills.length === 0 || loading}
            >
              {loading ? 'Finding Matches...' : 'Find Matching Jobs'}
            </button>
          </section>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Matched Jobs Section */}
      {showMatches && (
        <section className="dashboard-section">
          <h3>Job Match Analysis</h3>
          
          {/* Your Skills Display */}
          {candidateSkills.length > 0 && (
            <div className="your-skills-section">
              <strong>Your Skills ({candidateSkills.length}):</strong>
              <div className="skills-list">
                {candidateSkills.map((skill, i) => (
                  <span key={i} className="skill-tag your-skill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <h3>Matching Jobs {matchedJobs.length > 0 && `(${matchedJobs.length})`}</h3>
          {matchedJobs.length === 0 ? (
            <div className="no-matches">
              <p className="muted">No matching jobs found</p>
            </div>
          ) : (
            <div className="jobs-match-list">
              {matchedJobs.map((job, idx) => (
                <div key={idx} className="job-match-card">
                  <div className="job-match-header">
                    <div>
                      <h4>{job.title}</h4>
                      <p className="muted">{job.company}</p>
                    </div>
                    <div className={`match-badge match-${job.matchPercentage >= 70 ? 'high' : job.matchPercentage >= 40 ? 'medium' : 'low'}`}>
                      {Math.round(job.matchPercentage)}%
                    </div>
                  </div>

                  <p className="job-description">{job.description}</p>

                  {/* Skill Comparison */}
                  <div className="skill-comparison">
                    {/* Matched Skills */}
                    {job.matchedSkills && job.matchedSkills.length > 0 && (
                      <div className="skills-section">
                        <strong>✓ Your Matching Skills ({job.matchedSkills.length}):</strong>
                        <div className="skills-list">
                          {job.matchedSkills.map((skill, i) => (
                            <span key={i} className="skill-tag matched">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {job.missingSkills && job.missingSkills.length > 0 && (
                      <div className="skills-section">
                        <strong>✗ Skills to Learn ({job.missingSkills.length}):</strong>
                        <div className="skills-list">
                          {job.missingSkills.map((skill, i) => (
                            <span key={i} className="skill-tag missing">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Required Skills */}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="skills-section">
                        <strong>Required Skills for Position ({job.requiredSkills.length}):</strong>
                        <div className="skills-list">
                          {job.requiredSkills.map((skill, i) => (
                            <span 
                              key={i} 
                              className={`skill-tag ${
                                job.matchedSkills?.includes(skill) ? 'matched' : 'required'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Match Details */}
                  {job.semanticScore !== undefined && (
                    <div className="match-details">
                      <div className="score-item">
                        <strong>Semantic Match:</strong> {(job.semanticScore * 100).toFixed(1)}%
                      </div>
                      <div className="score-item">
                        <strong>Skill Match:</strong> {(job.skillScore * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}

                  <div className="job-meta">
                    <span className="meta-item">💼 {job.company}</span>
                    {job.salary && <span className="meta-item">💰 {job.salary}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
