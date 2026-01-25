import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import UploadForm from '../components/UploadForm'
import CandidateJobMatching from './CandidateJobMatching'
import { currentUser } from '../utils/auth'

export default function CandidateDashboard(){
  const [user, setUser] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loggedInUser = currentUser()
    setUser(loggedInUser)
    
    if (loggedInUser && loggedInUser.role === 'candidate') {
      fetchProfileData(loggedInUser.email)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfileData = async (emailOverride) => {
    try {
      const emailParam = emailOverride || user?.email
        ? `?email=${encodeURIComponent(emailOverride || user.email)}`
        : ''
      const response = await fetch(`http://localhost:8000/api/latest-candidate${emailParam}`)
      if (response.ok) {
        const result = await response.json()
        if (result.status === 'success' && result.data) {
          setProfileData(result.data)
        }
      }
    } catch (err) {
      console.error('Error fetching profile data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h2>Your Candidate Dashboard</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'candidate') {
    return (
      <div>
        <h2>Candidate Dashboard</h2>
        <div className="auth-required">
          <p>Please log in as a candidate to access this dashboard.</p>
          <Link to="/login" className="btn btn-primary">Login as Candidate</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2>Your Candidate Dashboard</h2>
      <p>Manage your profile and find matching job opportunities.</p>
      
      <div className="dashboard-actions">
        <Link to="/profile" className="btn btn-secondary">
          👤 My Profile
        </Link>
        <Link to="/explore" className="btn btn-secondary">
          🔍 Explore Jobs & Skills
        </Link>
      </div>
      
      {!profileData ? (
        <section className="dashboard-section">
          <h3>Get Started</h3>
          <p>Create your profile to start finding matching jobs.</p>
          <Link to="/profile" className="btn btn-primary">
            Create Profile
          </Link>
        </section>
      ) : (
        <>
          <section className="dashboard-section">
            <h3>Welcome back, {profileData.name || user?.name}!</h3>
            <div className="profile-summary">
              <div className="summary-item">
                <strong>Skills:</strong> {profileData.skills ? profileData.skills.length : 0}
              </div>
              <div className="summary-item">
                <strong>Email:</strong> {user?.email || profileData.email}
              </div>
              <div className="summary-item">
                <strong>Phone:</strong> {profileData.phone || 'Not provided'}
              </div>
              <div className="summary-item">
                <strong>Experience:</strong> {profileData.experience || 'Not provided'}
              </div>
              {profileData.uploadedAt && (
                <div className="summary-item">
                  <strong>Profile Created:</strong> {new Date(profileData.uploadedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </section>
          
          <CandidateJobMatching />
        </>
      )}
      
      {profileData && (
        <>
          <hr />
          <section className="dashboard-section">
            <h3>Update Resume</h3>
            <p>Upload an updated resume to improve your job matches.</p>
            <UploadForm />
          </section>
        </>
      )}
    </div>
  )
}
