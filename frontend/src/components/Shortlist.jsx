import React, { useState } from 'react'

export default function Shortlist() {
  const [keywords, setKeywords] = useState('')
  const [results, setResults] = useState(null)

  const run = async () => {
    const q = encodeURIComponent(keywords)
    const res = await fetch(`http://localhost:5000/api/candidates/shortlist?keywords=${q}`)
    const data = await res.json()
    setResults(data)
  }

  return (
    <section>
      <h2>Shortlist</h2>
      <div>
        <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="react,node,aws" />
        <button onClick={run}>Shortlist</button>
      </div>
      <div>
        {results && results.length === 0 && <div>No matches</div>}
        {results && results.map(r => (
          <div key={r.candidate._id} style={{ border: '1px solid #ddd', margin: 8, padding: 8 }}>
            <strong>{r.candidate.name}</strong> — score: {r.score}
            <div>{r.candidate.email}</div>
            <div>skills: {(r.candidate.skills || []).join(', ')}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
