# Virtual Science Lab — Platform Overview

## Introduction

Virtual Science Lab is a full-stack web platform that allows Algerian students (primary, middle, and high school) to conduct interactive, 3D virtual science experiments from any browser. Teachers can monitor student progress, filter by location and school level, and review quiz results.

---

## Architecture

```
virtual-science-lab/
├── client/          # React frontend (Vite + Tailwind + React Three Fiber)
│   └── src/
│       ├── api/           # Axios instance with auth interceptor
│       ├── contexts/      # React Context (AuthContext)
│       ├── components/    # Reusable UI (Layout/Sidebar)
│       └── pages/         # Route-level page components
├── server/          # Node.js + Express REST API
│   ├── models/      # Mongoose schemas
│   ├── routes/      # Express route handlers
│   └── middleware/  # JWT auth middleware
└── docs/            # Markdown documentation
```

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS v4, React Three Fiber, Three.js, Axios, React Router v6 |
| Backend    | Node.js, Express 4, Mongoose 7                  |
| Auth       | JWT (jsonwebtoken), bcryptjs                    |
| Database   | MongoDB                                         |
| 3D Engine  | Three.js via @react-three/fiber + @react-three/drei |

---

## Data Models

### User
```
{ username, email, password (hashed), role: 'student'|'teacher', timestamps }
```

### Student
```
{ userId (→User), name, school, wilaya, commune, level: 'primary'|'middle'|'high', timestamps }
```

### Experiment
```
{ title, subject, category, level, description, imageUrl, instructions[], quiz[{ question, options[], correctAnswer }], timestamps }
```

### Result
```
{ studentId (→Student), experimentId (→Experiment), completed, score, circuitCorrect, quizAnswers[], date, timestamps }
```

---

## API Endpoints

### Authentication — `/api/auth`
| Method | Path        | Description                     | Auth |
|--------|-------------|---------------------------------|------|
| POST   | `/register` | Register user (+ student profile) | No |
| POST   | `/login`    | Login, returns JWT token         | No  |

### Students — `/api/students`
| Method | Path  | Description              | Auth    |
|--------|-------|--------------------------|---------|
| GET    | `/me` | Get current student profile | JWT  |

### Experiments — `/api/experiments`
| Method | Path     | Description                       | Auth |
|--------|----------|-----------------------------------|------|
| GET    | `/`      | List experiments (filter by level) | JWT |
| GET    | `/:id`   | Get single experiment              | JWT  |
| POST   | `/seed`  | Seed sample experiments (dev only) | No  |

### Results — `/api/results`
| Method | Path   | Description                    | Auth |
|--------|--------|--------------------------------|------|
| POST   | `/`    | Submit experiment result        | JWT  |
| GET    | `/my`  | Get current student's results  | JWT  |

### Teacher — `/api/teacher`
| Method | Path        | Description                              | Auth          |
|--------|-------------|------------------------------------------|---------------|
| GET    | `/students` | List all students (with filters)         | JWT + teacher |
| GET    | `/results`  | List all results (populated)             | JWT + teacher |

---

## Frontend Routes

| Path         | Component          | Access          |
|--------------|--------------------|-----------------|
| `/login`     | Login              | Public          |
| `/register`  | Register           | Public          |
| `/dashboard` | StudentDashboard   | Student only    |
| `/lab/:id`   | VirtualLab (3D)    | Student only    |
| `/teacher`   | TeacherDashboard   | Teacher only    |

---

## Virtual Lab Architecture

The 3D lab (`VirtualLab.jsx`) uses React Three Fiber to render an interactive circuit simulation:

- **LabTable** — 3D wooden table base
- **Battery** — Clickable cylinder; connects battery on click (step 0)
- **Bulb** — Clickable sphere; connects bulb on click (step 1); glows with `pointLight` when circuit is complete
- **Switch** — Clickable toggle; turns ON/OFF (step 2+)
- **Wire** — Line segments drawn between components when connected

Circuit is complete when: battery connected + bulb connected + switch ON.  
On completion → Quiz tab unlocked → student submits answers → score saved to DB.

---

## Authentication Flow

1. User registers (POST `/api/auth/register`) → receives JWT
2. JWT stored in `localStorage`, attached to all requests via Axios interceptor
3. Protected routes check `token` via `ProtectedRoute` component
4. Role-based redirect: teachers → `/teacher`, students → `/dashboard`

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or Atlas URI

### Setup

```bash
# Install all dependencies
cd server && npm install
cd ../client && npm install

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your MONGO_URI and JWT_SECRET

# Seed experiments (requires MongoDB)
curl -X POST http://localhost:5000/api/experiments/seed

# Start development
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

---

## Extending the Platform

### Adding a New Experiment
1. Add to the seed array in `server/routes/experiments.js`
2. Re-run POST `/api/experiments/seed`
3. Create a new 3D scene component in `client/src/pages/VirtualLab.jsx` and route by `experiment.category`

### Adding a New Subject/Level
- Add level to `Experiment` model enum
- Add level label to `LEVEL_LABELS` in frontend pages
- Register students with the new level

### Adding Teacher Features
- Extend `server/routes/teacher.js` with new endpoints
- Add nav items to `Layout.jsx` for teachers

---

## Security Notes

- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days
- Teacher-only routes are protected by `teacherOnly` middleware
- CORS is enabled for all origins (restrict in production)
- Change `JWT_SECRET` in `.env` before deploying to production
