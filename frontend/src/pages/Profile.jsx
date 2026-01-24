import React, { useState, useEffect } from 'react'
import { currentUser } from '../utils/auth'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
    resumeFile: null
  })
  const [message, setMessage] = useState('')

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
          setFormData({
            name: result.data.name || user?.name || '',
            email: user?.email || result.data.email || '',
            phone: result.data.phone || '',
            experience: result.data.experience || '',
            skills: result.data.skills ? result.data.skills.join(', ') : '',
            resumeFile: null
          })
        }
      }
    } catch (err) {
      console.error('Error fetching profile data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
    setMessage('')
  }

  const handleCancel = () => {
    setEditing(false)
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        experience: profileData.experience || '',
        skills: profileData.skills ? profileData.skills.join(', ') : '',
        resumeFile: null
      })
    }
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const cleanedSkills = formData.skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .filter((skill, index, arr) => arr.indexOf(skill) === index)

    const form = new FormData()
    form.append('name', formData.name || user?.name || '')
    form.append('email', user?.email || formData.email)
    form.append('phone', formData.phone)
    form.append('experience', formData.experience)
    form.append('skills', cleanedSkills.join(', '))
    if (formData.resumeFile) {
      form.append('resume', formData.resumeFile)
    }

    try {
      const response = await fetch('http://localhost:8000/api/update-candidate', {
        method: 'POST',
        body: form
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.status === 'success') {
          setProfileData(result.data)
          setEditing(false)
          setMessage('Profile updated successfully!')
          setTimeout(() => setMessage(''), 3000)
          setTimeout(() => {
            fetchProfileData()
          }, 500)
        }
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (err) {
      setMessage('Error updating profile')
      console.error('Error updating profile:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      resumeFile: e.target.files[0]
    }))
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'candidate') {
    return (
      <div className="profile-page">
        <div className="auth-required">
          <h2>Profile</h2>
          <p>Please log in as a candidate to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>My Profile</h2>
        {!editing && profileData && (
          <button className="btn btn-secondary" onClick={handleEdit}>
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {!profileData && !editing ? (
        <div className="no-profile">
          <h3>No Profile Found</h3>
          <p>You haven't created your profile yet. Please upload your resume to get started.</p>
        </div>
      ) : editing ? (
        <div className="profile-form">
          <h3>Edit Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="experience">Experience</label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="skills">Skills (comma-separated)</label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="Python, JavaScript, React, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="resumeFile">Resume File (optional)</label>
              <input
                type="file"
                id="resumeFile"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {formData.resumeFile && (
                <small>Selected: {formData.resumeFile.name}</small>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : profileData ? (
        <div className="profile-display">
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{profileData.name || user?.name || ''}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user?.email || profileData.email}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{profileData.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Professional Information</h3>
            <div className="info-item">
              <label>Experience:</label>
              <p>{profileData.experience || 'Not provided'}</p>
            </div>
            <div className="info-item">
              <label>Resume:</label>
              <p>{profileData.resumeText || profileData.resume_text || 'Not provided'}</p>
            </div>
          </div>

          <div className="profile-section">
            <h3>Skills</h3>
            {profileData.skills && profileData.skills.length > 0 ? (
              <div className="skills-list">
                {profileData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p>No skills listed</p>
            )}
          </div>

          <div className="profile-section">
            <h3>Profile Information</h3>
            <div className="info-item">
              <label>Profile Created:</label>
              <span>
                {profileData.uploadedAt
                  ? new Date(profileData.uploadedAt).toLocaleDateString()
                  : 'Not available'}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
