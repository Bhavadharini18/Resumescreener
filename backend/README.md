Backend (Express + Mongoose)

Quick start:

1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Install deps and run:

```bash
cd backend
npm install
npm run dev
```

Endpoints:
- `POST /api/candidates` - form-data or JSON: `name`, `email`, `skills` (comma-separated or array), `resume` (file) or `resumeText`.
- `GET /api/candidates` - list all candidates
- `GET /api/candidates/shortlist?keywords=react,node` - returns matching candidates with scores

Notes: PDF parsing is not implemented; uploaded files are read as plain text for demo purposes.
