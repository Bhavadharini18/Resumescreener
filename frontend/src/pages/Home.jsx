import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    { icon: '⚡', title: 'AI-Powered Matching', description: 'Advanced semantic matching using Sentence Transformers to find perfect candidate-job alignments.' },
    { icon: '📊', title: 'Skill-Based Ranking', description: 'Intelligent skill extraction and matching with 70+ technical and soft skills database.' },
    { icon: '✓', title: 'Transparent Scoring', description: 'See exactly how candidates are scored with breakdown of semantic and skill components.' },
    { icon: '⚙', title: 'Lightning Fast', description: 'Process 50 resumes in seconds using optimized NLP pipelines and parallel processing.' },
    { icon: '•', title: 'Multi-Format Support', description: 'Seamlessly handle PDF and DOCX resume formats with intelligent text extraction.' },
    { icon: '→', title: 'Detailed Insights', description: 'Get comprehensive reports showing matched skills, missing qualifications, and match confidence.' },
  ]

  const steps = [
    { number: '1', title: 'Upload Resumes', description: 'Upload one or multiple resume files in PDF or DOCX format.' },
    { number: '2', title: 'Add Job Description', description: 'Paste the job description with requirements and desired qualifications.' },
    { number: '3', title: 'AI Processing', description: 'Our AI analyzes resumes and matches them against job requirements.' },
    { number: '4', title: 'Get Rankings', description: 'Receive ranked candidates with detailed scoring and insights.' },
  ]

  const benefits = [
    { title: 'For Recruiters', items: ['Save 80% screening time', 'Reduce bias in hiring', 'Find hidden gems', 'Data-driven decisions', 'Transparent metrics'] },
    { title: 'For Candidates', items: ['Fair evaluation process', 'See your match score', 'Improve your profile', 'Get feedback', 'Equal opportunities'] }
  ]

  const tech = [
    { label: 'AI', name: 'Sentence Transformers', desc: 'All-MiniLM-L6-v2 for semantic understanding' },
    { label: 'NL', name: 'SpaCy NER', desc: 'Named Entity Recognition for skill extraction' },
    { label: 'ML', name: 'Cosine Similarity', desc: 'Scikit-learn for precise matching' },
    { label: 'API', name: 'FastAPI', desc: 'High-performance backend API' },
  ]

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text fade-in-up">
            <h1 className="hero-title">Resume Screening Made Intelligent</h1>
            <p className="hero-subtitle">AI-powered candidate matching using advanced NLP. Find perfect matches, save time, reduce bias.</p>
            <div className="hero-buttons">
              <Link to="/jobs" className="btn btn-primary btn-lg">Browse Jobs</Link>
              <Link to="/register" className="btn btn-secondary btn-lg">Get Started</Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">5000+</div>
                <div className="stat-label">Resumes Processed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Match Accuracy</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">80%</div>
                <div className="stat-label">Time Saved</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-icon">📄</div>
              <div className="card-text">Upload</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">⚡</div>
              <div className="card-text">Process</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">✓</div>
              <div className="card-text">Match</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header fade-in-up">
          <h2>Why Choose Our Platform?</h2>
          <p>Powerful features designed for modern recruitment</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header fade-in-up">
          <h2>How It Works</h2>
          <p>Simple 4-step process to find your perfect candidates</p>
        </div>
        <div className="steps-container">
          {steps.map((s, i) => (
            <div key={i} className="step-card fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="step-number">{s.number}</div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              {i < steps.length - 1 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="section-header fade-in-up">
          <h2>Benefits for Everyone</h2>
          <p>Revolutionizing the hiring experience</p>
        </div>
        <div className="benefits-container">
          {benefits.map((b, i) => (
            <div key={i} className="benefit-card fade-in-up" style={{ animationDelay: `${i * 0.2}s` }}>
              <h3>{b.title}</h3>
              <ul className="benefit-list">
                {b.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="tech-section">
        <div className="section-header fade-in-up">
          <h2>Powered By Advanced AI</h2>
          <p>Built on cutting-edge NLP and machine learning</p>
        </div>
        <div className="tech-grid">
          {tech.map((t, i) => (
            <div key={i} className="tech-card fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="tech-label">{t.label}</div>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content fade-in-up">
          <h2>Ready to Transform Your Hiring?</h2>
          <p>Start screening resumes smarter today. Sign up for free and see the difference.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Start Free Trial</Link>
            <Link to="/jobs" className="btn btn-secondary btn-lg">Explore Features</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/jobs">Browse Jobs</Link></li>
              <li><Link to="/register">Sign Up</Link></li>
              <li><Link to="/login">Sign In</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li><a href="#features">AI Matching</a></li>
              <li><a href="#howitworks">How It Works</a></li>
              <li><a href="#benefits">Benefits</a></li>
              <li><a href="#tech">Technology</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>About</h4>
            <p>Resume Screener is an AI-powered platform revolutionizing recruitment through intelligent candidate matching and transparent scoring.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Resume Screener. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}