import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { currentUser } from '../utils/auth'

export default function Explore() {
  const [viewMode, setViewMode] = useState('jobs') // 'jobs' or 'skills'
  const [jobs, setJobs] = useState([])
  const [skills, setSkills] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [candidateSkills, setCandidateSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterExperience, setFilterExperience] = useState('all')
  const user = currentUser()

  // Fetch jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Fetch from Python backend API
        const response = await fetch('http://localhost:8000/api/explore-jobs')
        if (response.ok) {
          const result = await response.json()
          if (result.status === 'success') {
            const data = result.data
            setJobs(data.jobs || [])
            setSkills(data.skills || [])
            
            // Only fetch candidate skills if user is logged in
            if (user && user.role === 'candidate') {
              try {
                const candidateResponse = await fetch(`http://localhost:8000/api/latest-candidate?email=${encodeURIComponent(user.email)}`)
                if (candidateResponse.ok) {
                  const candidateResult = await candidateResponse.json()
                  if (candidateResult.status === 'success') {
                    setCandidateSkills(candidateResult.data.skills || [])
                  }
                }
              } catch (e) {
                console.error('Error fetching candidate data:', e)
              }
            }
            return
          }
        }
        
        // Fallback to sample data if API fails
        const jobsData = [
          {
            id: 1,
            title: "Senior Python Developer",
            company: "TechCorp Inc.",
            location: "San Francisco, CA",
            type: "Full-time",
            experience: "Senior",
            description: "We are looking for an experienced Python developer with expertise in Django, Flask, and cloud technologies. You will be working on scalable web applications and microservices architecture.",
            requiredSkills: ["Python", "Django", "Flask", "PostgreSQL", "AWS", "Docker", "REST API"],
            optionalSkills: ["React", "Redis", "Kubernetes", "GraphQL"],
            salary: "$120,000 - $160,000",
            posted: "2 days ago"
          },
          {
            id: 2,
            title: "Frontend React Developer",
            company: "Digital Solutions Ltd",
            location: "New York, NY",
            type: "Full-time",
            experience: "Mid-level",
            description: "Join our frontend team to build amazing user interfaces using React, TypeScript, and modern CSS frameworks. Experience with state management and testing required.",
            requiredSkills: ["React", "JavaScript", "TypeScript", "CSS", "HTML", "Redux"],
            optionalSkills: ["Next.js", "Vue.js", "Angular", "Testing Libraries"],
            salary: "$90,000 - $120,000",
            posted: "1 week ago"
          },
          {
            id: 3,
            title: "Full Stack Node.js Engineer",
            company: "StartupHub",
            location: "Remote",
            type: "Full-time",
            experience: "Mid-level",
            description: "Looking for a versatile Node.js developer who can handle both frontend and backend development. Experience with Express, MongoDB, and modern frontend frameworks required.",
            requiredSkills: ["Node.js", "Express", "MongoDB", "JavaScript", "React", "REST API"],
            optionalSkills: ["TypeScript", "PostgreSQL", "Docker", "AWS", "GraphQL"],
            salary: "$100,000 - $140,000",
            posted: "3 days ago"
          },
          {
            id: 4,
            title: "Data Science Engineer",
            company: "AI Analytics Corp",
            location: "Boston, MA",
            type: "Full-time",
            experience: "Senior",
            description: "Seeking a data scientist with strong Python skills and experience in machine learning, deep learning, and big data technologies. PhD or Masters preferred.",
            requiredSkills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics", "Data Analysis"],
            optionalSkills: ["PyTorch", "Scikit-learn", "Big Data", "AWS", "Docker"],
            salary: "$130,000 - $180,000",
            posted: "1 day ago"
          },
          {
            id: 5,
            title: "DevOps Engineer",
            company: "Cloud Systems Inc",
            location: "Seattle, WA",
            type: "Full-time",
            experience: "Mid-level",
            description: "We need a DevOps engineer to manage our cloud infrastructure, implement CI/CD pipelines, and ensure system reliability. Experience with AWS and containerization required.",
            requiredSkills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Bash"],
            optionalSkills: ["Terraform", "Ansible", "Monitoring Tools", "Networking"],
            salary: "$110,000 - $150,000",
            posted: "4 days ago"
          },
          {
            id: 6,
            title: "Mobile React Native Developer",
            company: "AppWorks Studio",
            location: "Austin, TX",
            type: "Full-time",
            experience: "Mid-level",
            description: "Create amazing mobile experiences using React Native. You'll work on iOS and Android apps, collaborate with designers, and implement best practices for mobile development.",
            requiredSkills: ["React Native", "JavaScript", "React", "Mobile Development", "iOS", "Android"],
            optionalSkills: ["TypeScript", "Redux", "Native Modules", "Performance Optimization"],
            salary: "$95,000 - $130,000",
            posted: "5 days ago"
          }
        ]
        
        setJobs(jobsData)
        
        // Extract all unique skills from jobs
        const allSkills = new Set()
        jobsData.forEach(job => {
          job.requiredSkills.forEach(skill => allSkills.add(skill))
          job.optionalSkills.forEach(skill => allSkills.add(skill))
        })
        
        const skillsArray = Array.from(allSkills).map(skill => {
          const requiredCount = jobsData.filter(job => job.requiredSkills.includes(skill)).length
          const optionalCount = jobsData.filter(job => job.optionalSkills.includes(skill)).length
          const totalCount = requiredCount + optionalCount
          
          return {
            name: skill,
            requiredIn: requiredCount,
            optionalIn: optionalCount,
            totalJobs: totalCount,
            importance: requiredCount > totalCount * 0.5 ? 'core' : 'optional'
          }
        }).sort((a, b) => b.totalJobs - a.totalJobs)
        
        setSkills(skillsArray)
        
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Filter jobs based on search and experience
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesExperience = filterExperience === 'all' || job.experience.toLowerCase() === filterExperience.toLowerCase()
    return matchesSearch && matchesExperience
  })

  // Filter skills based on search
  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate readiness for a job (only for authenticated candidates)
  const calculateReadiness = (job) => {
    if (!user || user.role !== 'candidate' || candidateSkills.length === 0) {
      return 0
    }
    const matchedSkills = job.requiredSkills.filter(skill => 
      candidateSkills.some(candidateSkill => 
        candidateSkill.toLowerCase() === skill.toLowerCase()
      )
    )
    return (matchedSkills.length / job.requiredSkills.length) * 100
  }

  // Get jobs that require a specific skill
  const getJobsForSkill = (skillName) => {
    return jobs.filter(job => 
      job.requiredSkills.includes(skillName) || job.optionalSkills.includes(skillName)
    )
  }

  // Check if candidate has a skill (only for authenticated candidates)
  const hasSkill = (skillName) => {
    if (!user || user.role !== 'candidate' || candidateSkills.length === 0) {
      return false
    }
    return candidateSkills.some(candidateSkill => 
      candidateSkill.toLowerCase() === skillName.toLowerCase()
    )
  }

  if (loading) {
    return (
      <div className="explore-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="explore-page">
      {/* Header */}
      <section className="explore-header">
        <div className="explore-header-content">
          <h1>Explore Jobs & Skills</h1>
          <p>Discover opportunities and understand what skills are in demand</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>
      </section>

      {/* View Toggle */}
      <section className="view-toggle-section">
        <div className="view-toggle-container">
          <div className="view-toggle-buttons">
            <button
              className={`view-toggle-btn ${viewMode === 'jobs' ? 'active' : ''}`}
              onClick={() => setViewMode('jobs')}
            >
              <span className="toggle-icon"></span>
              Explore by Jobs
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'skills' ? 'active' : ''}`}
              onClick={() => setViewMode('skills')}
            >
              <span className="toggle-icon"></span>
              Explore by Skills
            </button>
          </div>
          
          {viewMode === 'jobs' && (
            <div className="filters-container">
              <select
                value={filterExperience}
                onChange={(e) => setFilterExperience(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Levels</option>
                <option value="entry-level">Entry Level</option>
                <option value="mid-level">Mid Level</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Jobs View */}
      {viewMode === 'jobs' && (
        <section className="jobs-view-section">
          <div className="jobs-grid">
            {filteredJobs.map((job) => {
              const readiness = calculateReadiness(job)
              const matchedSkills = job.requiredSkills.filter(skill => 
                candidateSkills.some(candidateSkill => 
                  candidateSkill.toLowerCase() === skill.toLowerCase()
                )
              )
              
              return (
                <div key={job.id} className="job-card" onClick={() => setSelectedJob(job)}>
                  <div className="job-card-header">
                    <h3 className="job-title">{job.title}</h3>
                    <div className="job-meta">
                      <span className="company">{job.company}</span>
                      <span className="location">📍 {job.location}</span>
                      <span className="type">{job.type}</span>
                    </div>
                  </div>
                  
                  <div className="job-card-body">
                    <p className="job-description">{job.description.substring(0, 150)}...</p>
                    
                    <div className="skills-section">
                      <div className="skills-label">Required Skills:</div>
                      <div className="skills-tags">
                        {job.requiredSkills.slice(0, 4).map((skill, index) => (
                          <span 
                            key={index} 
                            className={`skill-tag ${user && user.role === 'candidate' && hasSkill(skill) ? 'has-skill' : 'missing-skill'}`}
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 4 && (
                          <span className="skill-more">+{job.requiredSkills.length - 4} more</span>
                        )}
                      </div>
                    </div>
                    
                    {user && user.role === 'candidate' && (
                      <div className="readiness-section">
                        <div className="readiness-label">Your Readiness:</div>
                        <div className="readiness-bar">
                          <div 
                            className="readiness-fill" 
                            style={{ width: `${readiness}%` }}
                          ></div>
                        </div>
                        <span className="readiness-percentage">{Math.round(readiness)}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="job-card-footer">
                    <span className="salary">{job.salary}</span>
                    <span className="posted">{job.posted}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Skills View */}
      {viewMode === 'skills' && (
        <section className="skills-view-section">
          <div className="skills-grid">
            {filteredSkills.map((skill) => (
              <div 
                key={skill.name} 
                className={`skill-card ${user && user.role === 'candidate' && hasSkill(skill.name) ? 'has-skill' : 'missing-skill'}`}
                onClick={() => setSelectedSkill(skill)}
              >
                <div className="skill-card-header">
                  <h3 className="skill-name">{skill.name}</h3>
                  {user && user.role === 'candidate' && (
                    <div className="skill-status">
                      {hasSkill(skill.name) ? (
                        <span className="status-badge has-badge">✓ You have this</span>
                      ) : (
                        <span className="status-badge missing-badge">✗ Missing</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="skill-stats">
                  <div className="stat-item">
                    <span className="stat-number">{skill.totalJobs}</span>
                    <span className="stat-label">Jobs require this</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{skill.requiredIn}</span>
                    <span className="stat-label">Core requirement</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{skill.importance}</span>
                    <span className="stat-label">Importance</span>
                  </div>
                </div>
                
                <div className="skill-importance">
                  <div className="importance-bar">
                    <div 
                      className={`importance-fill ${skill.importance}`}
                      style={{ width: `${(skill.requiredIn / skill.totalJobs) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content job-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedJob.title}</h2>
              <button className="modal-close" onClick={() => setSelectedJob(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="job-details">
                <div className="detail-row">
                  <span className="label">Company:</span>
                  <span>{selectedJob.company}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span>{selectedJob.location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span>{selectedJob.type}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Experience:</span>
                  <span>{selectedJob.experience}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Salary:</span>
                  <span>{selectedJob.salary}</span>
                </div>
              </div>
              
              <div className="job-description-full">
                <h3>Job Description</h3>
                <p>{selectedJob.description}</p>
              </div>
              
              <div className="skills-analysis">
                <h3>Skills Analysis</h3>
                
                <div className="skills-category">
                  <h4>Required Skills ({selectedJob.requiredSkills.length})</h4>
                  <div className="skills-list">
                    {selectedJob.requiredSkills.map((skill, index) => (
                      <div key={index} className={`skill-item ${user && user.role === 'candidate' && hasSkill(skill) ? 'has-skill' : 'missing-skill'}`}>
                        <span className="skill-name">{skill}</span>
                        {user && user.role === 'candidate' && (
                          <span className="skill-status">
                            {hasSkill(skill) ? '✓ Matched' : '✗ Missing'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="skills-category">
                  <h4>Optional Skills ({selectedJob.optionalSkills.length})</h4>
                  <div className="skills-list">
                    {selectedJob.optionalSkills.map((skill, index) => (
                      <div key={index} className={`skill-item ${user && user.role === 'candidate' && hasSkill(skill) ? 'has-skill' : 'missing-skill'}`}>
                        <span className="skill-name">{skill}</span>
                        {user && user.role === 'candidate' && (
                          <span className="skill-status">
                            {hasSkill(skill) ? '✓ Have' : '- Don\'t have'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {user && user.role === 'candidate' && (
                <div className="readiness-analysis">
                  <h3>Your Readiness</h3>
                  <div className="readiness-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${calculateReadiness(selectedJob)}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{Math.round(calculateReadiness(selectedJob))}% Ready</span>
                  </div>
                  <p className="readiness-advice">
                    {calculateReadiness(selectedJob) >= 80 
                      ? "Excellent match! You have most of the required skills."
                      : calculateReadiness(selectedJob) >= 60
                      ? "Good match! Consider learning the missing skills to improve your chances."
                      : "You might need to acquire more skills before applying for this role."
                    }
                  </p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <Link to={`/apply-job/${selectedJob.id}`} className="btn btn-primary">
                Apply for this Job
              </Link>
              <button className="btn btn-secondary" onClick={() => setSelectedJob(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="modal-overlay" onClick={() => setSelectedSkill(null)}>
          <div className="modal-content skill-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSkill.name}</h2>
              <button className="modal-close" onClick={() => setSelectedSkill(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="skill-overview">
                <div className="skill-metrics">
                  <div className="metric-card">
                    <span className="metric-value">{selectedSkill.totalJobs}</span>
                    <span className="metric-label">Jobs Available</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-value">{selectedSkill.requiredIn}</span>
                    <span className="metric-label">Core Requirement</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-value">{selectedSkill.importance}</span>
                    <span className="metric-label">Importance Level</span>
                  </div>
                </div>
                
                <div className="skill-status-banner">
                  {user && user.role === 'candidate' ? (
                    hasSkill(selectedSkill.name) ? (
                      <div className="status-banner has-banner">
                        <span className="banner-icon">✓</span>
                        <span>You have this skill! You can apply for {selectedSkill.totalJobs} jobs.</span>
                      </div>
                    ) : (
                      <div className="status-banner missing-banner">
                        <span className="banner-icon">!</span>
                        <span>Learning this skill could unlock {selectedSkill.totalJobs} job opportunities.</span>
                      </div>
                    )
                  ) : (
                    <div className="status-banner">
                      <span className="banner-icon">ℹ</span>
                      <span>This skill is required for {selectedSkill.totalJobs} job positions.</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="related-jobs">
                <h3>Jobs That Require This Skill</h3>
                <div className="jobs-list">
                  {getJobsForSkill(selectedSkill.name).map((job) => (
                    <div key={job.id} className="related-job-item">
                      <div className="job-info">
                        <h4>{job.title}</h4>
                        <p>{job.company} • {job.location}</p>
                      </div>
                      <div className="job-skill-type">
                        {job.requiredSkills.includes(selectedSkill.name) ? (
                          <span className="skill-type-badge required">Required</span>
                        ) : (
                          <span className="skill-type-badge optional">Optional</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedSkill(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
