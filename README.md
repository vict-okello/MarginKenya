# MarginKenya

Monorepo structure:

- `frontend/` - React + Vite client app
- `backend/` - Express API

## Frontend

From the project root:

```powershell
cd frontend
npm install
npm run dev
```

Build frontend:

```powershell
cd frontend
npm run build
npm run preview
```

## Backend

From the project root:

```powershell
cd backend
npm install
npm run dev
```

Health endpoint:

- `GET http://localhost:4000/api/health`

## Suggested Deployment Layout

- Deploy frontend from `frontend/`
- Deploy backend from `backend/`
