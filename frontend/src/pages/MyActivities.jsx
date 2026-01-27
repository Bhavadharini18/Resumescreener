import React, { useState, useEffect } from 'react'
import { currentUser } from '../utils/auth'

export default function MyActivities() {
  const [activities, setActivities] = useState([])
  const [appliedJobs, setAppliedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showJobModal, setShowJobModal] = useState(false)

  useEffect(() => {
    const loggedInUser = currentUser()
    setUser(loggedInUser)
    
    if (loggedInUser && loggedInUser.role === 'candidate') {
      fetchCandidateActivities(loggedInUser.email)
    } else {
      setError('Please log in as a candidate to view your activities')
      setLoading(false)
    }
  }, [])

  const fetchCandidateActivities = async (email) => {
    try {
      // Fetch applications
      const applicationsResponse = await fetch(`http://localhost:8000/api/candidate-applications?email=${encodeURIComponent(email)}`)
      let applications = []
      if (applicationsResponse.ok) {
        const result = await applicationsResponse.json()
        if (result.status === 'success') {
          applications = result.data.applications || []
        }
      }

      // Fetch jobs to get company names
      const jobsResponse = await fetch('http://localhost:5000/api/jobs')
      let jobs = []
      if (jobsResponse.ok) {
        jobs = await jobsResponse.json()
      }

      // Enrich applications with job data
      const enrichedApplications = applications.map(app => {
        const job = jobs.find(j => j.id === app.jobId || j._id === app.jobId)
        return {
          ...app,
          company: job ? job.company : app.company,
          location: job ? job.location : app.location
        }
      })

      // Fetch profile updates
      const profileResponse = await fetch(`http://localhost:8000/api/latest-candidate?email=${encodeURIComponent(email)}`)
      let profileData = null
      if (profileResponse.ok) {
        const result = await profileResponse.json()
        if (result.status === 'success') {
          profileData = result.data
        }
      }

      // Combine activities
      const allActivities = []
      
      // Add application activities
      enrichedApplications.forEach(app => {
        allActivities.push({
          type: 'application',
          title: `Applied for ${app.jobTitle}`,
          description: `Application submitted to ${app.company || 'Company'}`,
          timestamp: app.appliedAt,
          status: 'applied',
          jobData: app
        })
      })

      // Add profile update activity
      if (profileData && profileData.updatedAt) {
        allActivities.push({
          type: 'profile_update',
          title: 'Profile Updated',
          description: 'Your profile information was updated',
          timestamp: profileData.updatedAt,
          status: 'completed'
        })
      }

      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      
      setActivities(allActivities)
      setAppliedJobs(enrichedApplications)
    } catch (err) {
      setError('Error fetching activities: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewJobDetails = async (jobId) => {
    try {
      // Fetch from the same source as Jobs.jsx
      const response = await fetch('http://localhost:5000/api/jobs')
      if (response.ok) {
        const jobs = await response.json()
        const foundJob = jobs.find(j => j.id === jobId || j._id === jobId)
        if (foundJob) {
          setSelectedJob(foundJob)
          setShowJobModal(true)
        } else {
          setError('Job details not found')
        }
      } else {
        setError('Error fetching job details')
      }
    } catch (err) {
      setError('Error fetching job details: ' + err.message)
    }
  }

  const handleWithdrawApplication = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/withdraw-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateEmail: user.email,
          jobId: jobId
        })
      })

      if (response.ok) {
        // Refresh activities
        fetchCandidateActivities(user.email)
      } else {
        setError('Failed to withdraw application')
      }
    } catch (err) {
      setError('Error withdrawing application: ' + err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'status-applied'
      case 'under_review': return 'status-review'
      case 'shortlisted': return 'status-shortlisted'
      case 'rejected': return 'status-rejected'
      default: return 'status-default'
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="my-activities">
        <div className="loading">Loading your activities...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-activities">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="my-activities">
      <div className="activities-container">
        <h1>My Activities</h1>
        <p>Track your job applications and profile updates.</p>

        {/* Applied Jobs Section */}
        <section className="applied-jobs-section">
          <h2>Applied Jobs ({appliedJobs.length})</h2>
          
          {appliedJobs.length === 0 ? (
            <div className="empty-state">
              <p>You haven't applied to any jobs yet.</p>
              <a href="/explore" className="btn btn-primary">Browse Jobs</a>
            </div>
          ) : (
            <div className="applied-jobs-list">
              {appliedJobs.map((job, index) => (
                <div key={index} className="job-application-card">
                  <div className="job-header">
                    <div>
                      <h3>{job.jobTitle}</h3>
                      <p className="company">Company name: {job.company}</p>
                      {job.location && <p className="location">📍 {job.location}</p>}
                    </div>
                    <div className="application-meta">
                      <span className={`status-badge ${getStatusColor(job.status || 'applied')}`}>
                        {job.status ? job.status.replace('_', ' ').toUpperCase() : 'APPLIED'}
                      </span>
                      <span className="application-date">
                        {formatDate(job.appliedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="job-details">
                    {job.matchPercentage !== undefined && (
                      <div className="match-score">
                        <strong>Match Score:</strong>
                        <span className="score-badge">
                          {Math.round(job.matchPercentage)}%
                        </span>
                      </div>
                    )}

                    {job.matchedSkills && job.matchedSkills.length > 0 && (
                      <div className="matched-skills">
                        <strong>Matched Skills:</strong>
                        <div className="skills-list">
                          {job.matchedSkills.map((skill, i) => (
                            <span key={i} className="skill-tag matched">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="job-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleViewJobDetails(job.jobId)}>
                      View Details
                    </button>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleWithdrawApplication(job.jobId)}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Activity Timeline */}
        <section className="activity-timeline-section">
          <h2>Activity Timeline</h2>
          
          {activities.length === 0 ? (
            <div className="empty-state">
              <p>No activities yet.</p>
            </div>
          ) : (
            <div className="timeline">
              {activities.map((activity, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker">
                    {activity.type === 'application' ? '' : ''}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{activity.title}</h4>
                      <span className="timeline-date">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                    <p className="timeline-description">
                      {activity.description}
                    </p>
                    {activity.type === 'application' && activity.jobData && (
                      <div className="timeline-job-details">
                        {activity.jobData.matchPercentage !== undefined && (
                          <span className="timeline-match-score">
                            Match: {Math.round(activity.jobData.matchPercentage)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="modal-content job-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedJob.title}</h2>
              <button className="modal-close" onClick={() => setShowJobModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="job-info">
                <div className="company-info">
                  <h3>Company name: {selectedJob.company}</h3>
                  {selectedJob.location && <p className="location">📍 {selectedJob.location}</p>}
                </div>
                
                <div className="job-meta">
                  {selectedJob.type && (
                    <span className="meta-badge">{selectedJob.type}</span>
                  )}
                  {selectedJob.experience && (
                    <span className="meta-badge">{selectedJob.experience}</span>
                  )}
                  {selectedJob.salary && (
                    <span className="meta-badge salary">{selectedJob.salary}</span>
                  )}
                </div>
                
                <div className="posted-date">
                  <small>Posted: {selectedJob.posted}</small>
                </div>
              </div>

              <div className="job-description">
                <h4>Job Description</h4>
                <p>{selectedJob.description}</p>
              </div>

              {selectedJob.requiredSkills && selectedJob.requiredSkills.length > 0 && (
                <div className="required-skills">
                  <h4>Required Skills</h4>
                  <div className="skills-list">
                    {selectedJob.requiredSkills.map((skill, index) => (
                      <span key={index} className="skill-tag required">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.optionalSkills && selectedJob.optionalSkills.length > 0 && (
                <div className="optional-skills">
                  <h4>Optional Skills</h4>
                  <div className="skills-list">
                    {selectedJob.optionalSkills.map((skill, index) => (
                      <span key={index} className="skill-tag optional">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowJobModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
