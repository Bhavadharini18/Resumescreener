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

  const [showApplyForm, setShowApplyForm] = useState(false)
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    resumeFile: null,
    candidateSkills: ''
  })
  const [formErrors, setFormErrors] = useState({})

  const handleApply = (job) => {
    setSelectedJob(job)
    setShowApplyForm(true)
    setApplicationResult(null)
    setFormData({
      candidateName: '',
      candidateEmail: '',
      resumeFile: null,
      candidateSkills: ''
    })
    setFormErrors({})
  }

  const handleFormInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) {
        setFormErrors(prev => ({
          ...prev,
          resumeFile: 'Please upload a PDF or DOCX file'
        }))
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          resumeFile: 'File size must be less than 10MB'
        }))
        return
      }

      setFormData(prev => ({
        ...prev,
        resumeFile: file
      }))
      setFormErrors(prev => ({
        ...prev,
        resumeFile: ''
      }))
    }
  }

  const handleSubmitApplication = async (e) => {
    e.preventDefault()
    
    // Validation
    const newErrors = {}
    if (!formData.candidateName.trim()) {
      newErrors.candidateName = 'Name is required'
    }
    if (!formData.candidateEmail.trim()) {
      newErrors.candidateEmail = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.candidateEmail)) {
      newErrors.candidateEmail = 'Please enter a valid email address'
    }
    if (!formData.resumeFile && !formData.candidateSkills.trim()) {
      newErrors.resumeFile = 'Please upload a resume or enter your skills'
      newErrors.candidateSkills = 'Please upload a resume or enter your skills'
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }

    setLoading(true)
    setFormErrors({})

    try {
      const job = selectedJob
      
      // Prepare form data for multipart/form-data
      const formDataToSend = new FormData()
      
      if (formData.resumeFile) {
        formDataToSend.append('resume', formData.resumeFile)
      }
      
      formDataToSend.append('candidate_name', formData.candidateName)
      formDataToSend.append('candidate_email', formData.candidateEmail)
      formDataToSend.append('job_id', job._id || job.id || `job_${Date.now()}`)
      formDataToSend.append('job_title', job.title)
      formDataToSend.append('job_description', job.description || '')
      
      if (job.requiredSkills && job.requiredSkills.length > 0) {
        formDataToSend.append('required_skills', job.requiredSkills.join(','))
      }
      
      if (formData.candidateSkills.trim()) {
        formDataToSend.append('candidate_skills', formData.candidateSkills)
      }

      // Call the new endpoint that handles file uploads
      const response = await fetch('http://localhost:8000/api/apply-job-with-resume', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()

      if (response.ok && data.data) {
        setApplicationResult(data.data)
        setShowApplyForm(false)
      } else {
        setFormErrors({
          submit: data.error_message || data.detail || data.message || 'Failed to process application. Please try again.'
        })
      }
    } catch (error) {
      console.error('Application error:', error)
      setFormErrors({
        submit: 'An error occurred while processing your application. Please try again.'
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

      {/* Apply Form Modal */}
      {showApplyForm && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '10px', color: '#333' }}>
              Apply for {selectedJob.title}
            </h2>
            <p style={{ color: '#666', marginBottom: '25px' }}>
              {selectedJob.company}
            </p>

            <form onSubmit={handleSubmitApplication}>
              {/* Candidate Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Full Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleFormInputChange}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${formErrors.candidateName ? '#f44336' : '#ddd'}`,
                    borderRadius: '6px',
                    fontSize: '15px',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.candidateName && (
                  <div style={{ color: '#f44336', fontSize: '13px', marginTop: '5px' }}>
                    {formErrors.candidateName}
                  </div>
                )}
              </div>

              {/* Candidate Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Email Address <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  name="candidateEmail"
                  value={formData.candidateEmail}
                  onChange={handleFormInputChange}
                  placeholder="your.email@example.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${formErrors.candidateEmail ? '#f44336' : '#ddd'}`,
                    borderRadius: '6px',
                    fontSize: '15px',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.candidateEmail && (
                  <div style={{ color: '#f44336', fontSize: '13px', marginTop: '5px' }}>
                    {formErrors.candidateEmail}
                  </div>
                )}
              </div>

              {/* Resume Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Upload Resume (PDF or DOCX)
                </label>
                <input
                  type="file"
                  name="resumeFile"
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${formErrors.resumeFile ? '#f44336' : '#ddd'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                />
                {formErrors.resumeFile && (
                  <div style={{ color: '#f44336', fontSize: '13px', marginTop: '5px' }}>
                    {formErrors.resumeFile}
                  </div>
                )}
                {formData.resumeFile && (
                  <div style={{ 
                    color: '#4CAF50', 
                    fontSize: '13px', 
                    marginTop: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    ✓ {formData.resumeFile.name} ({(formData.resumeFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
                <div style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                  Accepted formats: PDF, DOCX (Max 10MB)
                </div>
              </div>

              {/* OR Divider */}
              <div style={{ 
                textAlign: 'center', 
                margin: '20px 0',
                color: '#999',
                fontSize: '14px',
                position: 'relative'
              }}>
                <span style={{ backgroundColor: 'white', padding: '0 15px' }}>OR</span>
                <div style={{ 
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  backgroundColor: '#ddd',
                  zIndex: -1
                }}></div>
              </div>

              {/* Skills Text Input */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Enter Your Skills (comma-separated)
                </label>
                <textarea
                  name="candidateSkills"
                  value={formData.candidateSkills}
                  onChange={handleFormInputChange}
                  placeholder="e.g., Python, JavaScript, React, Node.js"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${formErrors.candidateSkills ? '#f44336' : '#ddd'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
                {formErrors.candidateSkills && (
                  <div style={{ color: '#f44336', fontSize: '13px', marginTop: '5px' }}>
                    {formErrors.candidateSkills}
                  </div>
                )}
                <div style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                  Enter your skills if you don't have a resume file to upload
                </div>
              </div>

              {formErrors.submit && (
                <div style={{
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {formErrors.submit}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowApplyForm(false)
                    setSelectedJob(null)
                    setFormData({
                      candidateName: '',
                      candidateEmail: '',
                      resumeFile: null,
                      candidateSkills: ''
                    })
                    setFormErrors({})
                  }}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: loading ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    minWidth: '120px'
                  }}
                >
                  {loading ? 'Processing...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Result Modal */}
      {applicationResult && selectedJob && !showApplyForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
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
              <ApplicationResults 
                result={applicationResult}
                job={selectedJob}
                onClose={() => {
                  setApplicationResult(null)
                  setSelectedJob(null)
                }}
              />
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
  const matchedSkills = result.matched_skills || result.matchedSkills || []
  const missingSkills = result.missing_skills || result.missingSkills || []
  const improvements = result.improvements || []

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: '10px', color: '#333' }}>
        Application Results
      </h2>
      <p style={{ color: '#666', marginBottom: '25px' }}>
        {job?.title} at {job?.company}
      </p>

      {/* Large Visual Percentage Indicator */}
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '25px',
        border: `4px solid ${matchColor}`,
        textAlign: 'center'
      }}>
        <div style={{fontSize: '16px', color: '#666', marginBottom: '15px', fontWeight: 'bold'}}>
          Skill Match Percentage
        </div>
        <div style={{
          fontSize: '64px',
          fontWeight: 'bold',
          color: matchColor,
          marginBottom: '10px',
          lineHeight: '1'
        }}>
          {matchPercentage.toFixed(1)}%
        </div>
        <div style={{
          fontSize: '16px',
          color: '#666',
          marginTop: '10px',
          fontWeight: '500'
        }}>
          {matchPercentage >= 75 
            ? '🎉 Excellent Match! You are highly qualified for this position.' 
            : matchPercentage >= 50 
            ? '👍 Good Match! You have a solid foundation for this role.' 
            : '📚 Needs Improvement. Focus on developing the missing skills below.'}
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

      {/* Missing Skills - Skills to Develop */}
      {missingSkills.length > 0 && (
        <div style={{marginBottom: '25px'}}>
          <h3 style={{color: '#f44336', marginBottom: '15px', fontSize: '18px'}}>
            📚 Skills to Develop ({missingSkills.length})
          </h3>
          <div style={{ 
            backgroundColor: '#fff3e0',
            padding: '15px',
            borderRadius: '8px',
            border: '2px solid #ff9800'
          }}>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px'}}>
              {missingSkills.map((skill, i) => (
                <span 
                  key={i}
                  style={{
                    backgroundColor: '#ffe0b2',
                    color: '#e65100',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              fontStyle: 'italic',
              paddingTop: '10px',
              borderTop: '1px solid #ffcc80'
            }}>
              💡 <strong>Tip:</strong> Focus on learning these skills to improve your match percentage. 
              Consider online courses, certifications, or hands-on projects to develop them.
            </div>
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {improvements.length > 0 && (
        <div style={{marginBottom: '25px'}}>
          <h3 style={{color: '#1976d2', marginBottom: '15px', fontSize: '18px'}}>
            💡 Recommendations
          </h3>
          <ul style={{ 
            paddingLeft: '20px', 
            lineHeight: '1.8', 
            color: '#333',
            margin: 0
          }}>
            {improvements.map((item, i) => (
              <li key={i} style={{ marginBottom: '10px', fontSize: '14px' }}>
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
