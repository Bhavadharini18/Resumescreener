import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../../utils/auth'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('candidate')
  const [phone, setPhone] = useState('')
  const [experience, setExperience] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = e => {
    e.preventDefault()
    try{
      const user = register({ name, email, password, role, phone, experience, company })
      if (user.role === 'recruiter') navigate('/recruiter')
      else navigate('/candidate')
      window.location.reload()
    }catch(err){ setError(err.message) }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join our platform today</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name"
              type="text"
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="Your Name"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email"
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="your@email.com"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                placeholder="Enter a strong password"
                required 
                style={{ paddingRight: '40px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {showPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="role">I am a</label>
            <select id="role" value={role} onChange={e=>setRole(e.target.value)} className="auth-select">
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>
          {role === 'candidate' && (
            <>
              <div className="form-group">
                <label htmlFor="phone">Phone (10 digits)</label>
                <input 
                  id="phone"
                  type="tel"
                  value={phone} 
                  onChange={e=>setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  placeholder="1234567890"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="experience">Experience</label>
                <textarea 
                  id="experience"
                  value={experience} 
                  onChange={e=>setExperience(e.target.value)} 
                  placeholder="Your work experience"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="company">Company/College</label>
                <input 
                  id="company"
                  type="text"
                  value={company} 
                  onChange={e=>setCompany(e.target.value)} 
                  placeholder="Current or previous company/college"
                />
              </div>
            </>
          )}
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="auth-button">Create Account</button>
        </form>
        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  )
}
