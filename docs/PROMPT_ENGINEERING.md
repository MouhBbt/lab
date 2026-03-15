# Virtual Science Lab — Prompt Engineering Guide

This document contains prompt templates for AI-assisted development and extension of the Virtual Science Lab platform.

---

## 1. Adding a New 3D Experiment Scene

**Use when:** You want to add a new interactive 3D simulation beyond the electric circuit.

```
You are a React Three Fiber developer working on a Virtual Science Lab platform.

Context:
- The VirtualLab.jsx file renders a 3D scene inside a <Canvas> using @react-three/fiber and @react-three/drei
- The existing CircuitScene component demonstrates the pattern: step-based interaction, clickable 3D objects, completion callback
- The parent receives `onCircuitComplete(true)` when the experiment is done

Task:
Create a new React Three Fiber scene component called `[ExperimentName]Scene` for the experiment: "[EXPERIMENT TITLE]"

Requirements:
1. Use Box, Cylinder, Sphere, Text from @react-three/drei
2. Implement a step-based interaction (user clicks objects in sequence)
3. Call `onComplete(true)` prop when the experiment steps are finished
4. Add ambient + directional lighting
5. Include OrbitControls with reasonable min/max distance
6. Add hover effects (color change on onPointerOver/onPointerOut)
7. Use useFrame for any animations

Experiment description: [DESCRIPTION]
Steps the user should perform: [STEP 1, STEP 2, STEP 3...]
```

---

## 2. Adding a New API Endpoint

**Use when:** You need to add a backend feature (e.g., leaderboard, analytics).

```
You are a Node.js/Express developer working on a REST API for a Virtual Science Lab.

Tech stack:
- Express 4, Mongoose 7, JWT authentication
- Auth middleware is in server/middleware/auth.js — use `auth` middleware for protected routes
- Teacher-only routes use a local `teacherOnly` middleware that checks req.user.role

Existing models: User, Student, Experiment, Result (see server/models/)

Task:
Create a new Express router file at server/routes/[name].js that implements:
[DESCRIBE THE ENDPOINTS NEEDED]

Requirements:
- Use async/await with try/catch returning appropriate HTTP status codes
- Populate references where needed using Mongoose .populate()
- Export the router as `module.exports = router`
- Register it in server/index.js as `app.use('/api/[name]', require('./routes/[name]'))`
```

---

## 3. Adding a New Frontend Page

**Use when:** You need a new React page (e.g., student profile edit, leaderboard).

```
You are a React developer working on a Virtual Science Lab frontend.

Tech stack:
- React 18 with Vite, Tailwind CSS v4
- Routing: React Router v6 (useNavigate, useParams, Link)
- API: Axios instance at client/src/api/axios.js (baseURL: '/api', auto-attaches JWT)
- Auth: useAuth() from client/src/contexts/AuthContext.jsx returns { user, token, login, logout }
- Layout: import Layout from '../components/Layout' — wraps content with dark sidebar

Design system (dark theme):
- Background: bg-gray-950 (page), bg-gray-900 (cards)
- Borders: border-gray-800
- Text: text-white (headings), text-gray-400 (labels), text-cyan-400 (accents)
- Buttons: bg-gradient-to-r from-cyan-500 to-blue-600 (primary), bg-gray-700 (secondary)
- Rounded: rounded-xl (cards), rounded-lg (inputs/buttons)

Task:
Create client/src/pages/[PageName].jsx that:
[DESCRIBE WHAT THE PAGE SHOULD DO]

Include: loading state spinner, error handling, responsive grid layout.
```

---

## 4. Debugging a React Three Fiber Issue

```
You are debugging a React Three Fiber (r3f) component in a Virtual Science Lab.

Setup:
- @react-three/fiber and @react-three/drei are installed
- Canvas is rendered in a div with explicit height (h-full on parent)
- OrbitControls is used for camera control

Problem:
[DESCRIBE THE ISSUE — e.g., "objects are not clickable", "lights not working", "scene is black"]

Relevant component code:
[PASTE COMPONENT CODE]

Please diagnose and fix the issue, explaining what caused it.
```

---

## 5. Adding MongoDB Aggregation / Analytics

```
You are a MongoDB/Mongoose developer working on a Virtual Science Lab.

Data models:
- Result: { studentId (→Student), experimentId (→Experiment), completed, score, date }
- Student: { userId (→User), name, school, wilaya, commune, level }
- Experiment: { title, subject, category, level }

Task:
Write a Mongoose aggregation pipeline for the following analytics query:
[DESCRIBE THE ANALYTICS — e.g., "average score per wilaya", "top 10 students by score", "completion rate per experiment"]

Return the result as an Express route handler in the /api/teacher router.
```

---

## 6. Generating Quiz Questions

```
You are an educational content creator for an Algerian science curriculum platform.

Context:
- Target audience: [primary/middle/high] school students in Algeria
- Subject: [Physics/Chemistry/Natural Sciences/Scientific Education]
- Experiment: [EXPERIMENT TITLE]
- Experiment description: [DESCRIPTION]

Task:
Generate 5 multiple-choice quiz questions about this experiment.

Format each question as JSON:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0  // index of correct option (0-3)
}

Requirements:
- Questions should test understanding of the scientific concept demonstrated
- One clearly correct answer per question
- Plausible but incorrect distractors
- Age-appropriate language for [level] students
- Based on the Algerian national curriculum
```

---

## 7. Seed Data Generation

```
You are generating seed data for a Virtual Science Lab's MongoDB database.

The Experiment model has these fields:
- title: String (required)
- subject: String (required) — e.g., "Physics", "Chemistry", "Natural Sciences", "Scientific Education"
- category: String (required) — e.g., "Electricity", "Mechanics", "Biology", "General Science"
- level: "primary" | "middle" | "high"
- description: String
- instructions: String[] — step by step instructions (4-6 steps)
- quiz: [{ question, options: String[4], correctAnswer: Number }]

Generate [N] experiment objects as a JavaScript array for the following subjects and levels:
[LIST SUBJECTS AND LEVELS]

Ensure variety across subjects and that each experiment has 3-5 quiz questions.
Output as valid JavaScript array literal (no imports needed).
```

---

## 8. Tailwind Component Generation

```
You are a Tailwind CSS v4 developer working on a dark-themed science lab platform.

Design tokens in use:
- Dark backgrounds: gray-950 (page), gray-900 (cards/sidebar), gray-800 (inputs)
- Accent: cyan-400/500/600
- Success: green-400/500
- Warning: yellow-400
- Error: red-400/500
- Text: white (primary), gray-400 (secondary), gray-500 (muted)
- Borders: border-gray-800, rounded-xl

Create a Tailwind CSS component for: [DESCRIBE COMPONENT]

Requirements:
- No external CSS — Tailwind utility classes only
- Dark theme consistent with the existing palette
- Include hover and focus states
- Mobile responsive where applicable
- Export as a React functional component
```
