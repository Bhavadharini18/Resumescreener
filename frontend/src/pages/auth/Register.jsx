import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../../utils/auth'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('candidate')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = e => {
    e.preventDefault()
    try{
      const user = register({ name, email, password, role })
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
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="Enter a strong password"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">I am a</label>
            <select id="role" value={role} onChange={e=>setRole(e.target.value)} className="auth-select">
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>
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
