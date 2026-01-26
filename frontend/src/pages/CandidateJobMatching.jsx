import React, { useEffect, useState } from 'react'
import { currentUser } from '../utils/auth'

export default function CandidateJobMatching(){
  const [jobs, setJobs] = useState([])
  const [candidateSkills, setCandidateSkills] = useState([])
  const [candidateProfile, setCandidateProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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
        if (result.status === 'success' && result.data) {
          setCandidateProfile(result.data)
          setCandidateSkills(result.data.skills || [])
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
          {candidateProfile && (
            <section className="dashboard-section">
              <h3>Your Profile Details</h3>
              <div className="profile-summary">
                <div className="summary-item">
                  <strong>Name:</strong> {candidateProfile.name || user?.name}
                </div>
                <div className="summary-item">
                  <strong>Email:</strong> {user?.email || candidateProfile.email}
                </div>
                <div className="summary-item">
                  <strong>Phone:</strong> {candidateProfile.phone || 'Not provided'}
                </div>
                <div className="summary-item">
                  <strong>Experience:</strong> {candidateProfile.experience || 'Not provided'}
                </div>
              </div>
            </section>
          )}
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
          </section>
        </>
      )}
    </div>
  )
}
