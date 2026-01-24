import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { currentUser, logout } from '../utils/auth'

export default function Nav(){
  const user = currentUser()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const doLogout = () => { 
    logout()
    navigate('/')
    window.location.reload()
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">★</span>
          <span className="brand-text">Quickz</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <nav className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-section">
            <span className="nav-title"></span>
            <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/explore" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Explore Jobs & Skills
            </Link>
            <Link to="/jobs" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Browse Jobs
            </Link>
            {user && user.role === 'recruiter' && (
              <Link to="/post-job" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Post Job
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="nav-section">
            {user ? (
              <>
                <span className="nav-title"></span>
                <div className="nav-user-info">
                  <div>
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                </div>
                {user.role === 'recruiter' ? (
                  <Link to="/recruiter" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/candidate" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                      Find Matches
                    </Link>
                  </>
                )}
                <button className="nav-link logout-btn" onClick={() => {
                  doLogout()
                  setMobileMenuOpen(false)
                }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <span className="nav-title"></span>
                <Link to="/register" className="nav-link nav-link-highlight" onClick={() => setMobileMenuOpen(false)}>
                  Create Account
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="nav-user-badge">
              {user.name} ({user.role})
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
