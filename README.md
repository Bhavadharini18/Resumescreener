Resume Shortlister (MERN)

Structure:
- backend/ — Express + Mongoose API
- frontend/ — React (Vite) UI

Quick run (requires Node.js and MongoDB):

1) Backend

```powershell
cd "C:/Users/bhava/OneDrive/Documents/resume shortlister/backend"
npm install
# copy .env.example to .env and set MONGODB_URI
npm run dev
```

2) Frontend

```powershell
cd "C:/Users/bhava/OneDrive/Documents/resume shortlister/frontend"
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:5000`.
