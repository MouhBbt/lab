# Virtual Science Lab 🔬

A full-stack web platform for interactive virtual science experiments for Algerian students (primary, middle, and high school).

## Features

- 🧪 **3D Virtual Experiments** — Interactive React Three Fiber simulations (electric circuit, free fall, chemistry tests, and more)
- 🎓 **Role-based Access** — Separate student and teacher dashboards
- �� **Progress Tracking** — Quiz scores and experiment completion saved per student
- 🏫 **Teacher Analytics** — Filter students by wilaya, commune, school, and level
- 🔐 **JWT Authentication** — Secure login with bcrypt-hashed passwords

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS v4, React Three Fiber (Three.js), React Router v6
- **Backend:** Node.js, Express 4
- **Database:** MongoDB with Mongoose 7
- **Auth:** JWT + bcryptjs

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone and install
git clone <repo-url>
cd virtual-science-lab

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Configure environment
cp server/.env.example server/.env
# Edit server/.env — set MONGO_URI and JWT_SECRET
```

### Running in Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

### Seed Experiments

After starting the server with a MongoDB connection:

```bash
curl -X POST http://localhost:5000/api/experiments/seed
```

## Project Structure

```
virtual-science-lab/
├── client/                    # React frontend
│   └── src/
│       ├── api/axios.js       # Axios instance
│       ├── contexts/          # AuthContext
│       ├── components/        # Layout (sidebar)
│       └── pages/             # Login, Register, StudentDashboard, VirtualLab, TeacherDashboard
├── server/                    # Express API
│   ├── models/                # User, Student, Experiment, Result
│   ├── routes/                # auth, students, experiments, results, teacher
│   └── middleware/auth.js     # JWT verification
└── docs/                      # Platform overview & prompt engineering guide
```

## API

See [docs/PLATFORM_OVERVIEW.md](docs/PLATFORM_OVERVIEW.md) for full API documentation.

## License

MIT
