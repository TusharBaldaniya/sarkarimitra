# SarkariMitra (SarkariMitra) — Government Exam MCQ Platform

A clean, production-ready, mobile-first web application for conducting online MCQ/mock exams for students preparing for competitive government examinations.

---

## 🌟 Architecture & Features

### 1. Admin Panel
- **Protected Authentication**: Secure admin login using JWT and bcryptjs.
- **Dashboard Overview**: Metrics for total question bank size, total exams created, live active exams, and total student attempt submissions.
- **Question Bank Management**:
  - Full CRUD operations with category and difficulty filters.
  - Server-side pagination and real-time search.
  - **Bulk CSV Import**: Drag-and-drop CSV upload with row-level validation, preview, invalid row reporting, and bulk database insert.
- **Exam Management**:
  - Configure exam title, description, start date/time, end date/time, and duration in minutes.
  - Select and order questions directly from the question bank.
  - Generates a cryptographically secure random token URL (`/exam/:token`).
  - Toggle live status (`Active`, `Upcoming`, `Expired`, `Disabled`).
  - Single-click exam link copying.
- **Student Results Leaderboard**:
  - View attempts for each exam ranked by score and submission date.
  - Aggregated performance stats (average score, highest score, total attempts).
  - Search candidates by name.
  - Detailed single-attempt inspection displaying questions, student choices, correct answers, correctness state, and explanations.

### 2. Student Exam Interface (Mobile-First)
- **Zero Registration/Account Requirement**: Students only enter their name before starting an exam.
- **Token-Based Public Access**: Accessed via `/exam/:token`.
- **Backend Availability Validation**: Enforces exam token existence, active status, and timing (`startAt <= NOW <= endAt`).
- **Mobile-Optimized Interface**: Built for 360px - 430px mobile screens as well as tablets and desktops.
- **Live Countdown Timer**: Sticky timer calculating remaining time based on server `startedAt + durationMinutes`. Automatically submits test when time hits zero.
- **Large Touch Option Buttons**: Full clickable area with active state highlighting.
- **Question Palette**: Grid navigation drawer showing Answered (emerald), Unanswered (gray), and Current question with direct jump capabilities.
- **Submission Safeguards**:
  - Backend score calculation (+1 for correct, 0 for wrong/unanswered).
  - Question options sent to student **never include `correctAnswer` or `explanation`** until after submission.
  - Submission confirmation dialog displaying answered vs unanswered count.
  - Prevents duplicate or modified submissions.
- **Result & Review Dashboard**: Displays score, percentage, correct/wrong/unanswered stats, and optional detailed question-by-question answer review.

---

## 📂 Repository Structure

```text
SarkariMitra/
├── frontend/
│   ├── src/
│   │   ├── components/       # AdminLayout, ProtectedRoute, Modals
│   │   ├── context/          # AuthContext for Admin JWT auth
│   │   ├── pages/            # AdminLogin, Dashboard, QuestionBank, ExamList, ExamForm, ExamResults, StudentAttemptDetail, StudentExamStart, StudentExamInterface, StudentResult
│   │   ├── services/         # Axios API client setup
│   │   ├── App.jsx           # React Router v6 setup
│   │   ├── index.css         # Tailwind & custom utility styling
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/
│   ├── src/
│   │   ├── controllers/      # authController, questionController, examController, publicExamController
│   │   ├── routes/           # authRoutes, questionRoutes, examRoutes, publicExamRoutes
│   │   ├── middleware/       # auth.js, validate.js
│   │   ├── utils/            # prisma.js singleton
│   │   ├── app.js            # Express app configuration
│   │   └── server.js         # Local HTTP dev server
│   ├── api/
│   │   └── index.js          # Vercel serverless entrypoint
│   ├── prisma/
│   │   ├── schema.prisma     # PostgreSQL models
│   │   └── seed.js           # Database seed script
│   ├── package.json
│   ├── vercel.json           # Vercel backend rewrite rules
│   └── .env
│
├── package.json              # Monorepo root package
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, JavaScript, React Router v6, Axios, Tailwind CSS, Lucide React icons.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Prisma ORM, Helmet, CORS, csv-parse.
- **Database**: PostgreSQL (works seamlessly with NeonDB cloud connection strings).

---

## 🚀 Quick Setup & Local Development

### 1. Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database URL (e.g. NeonDB PostgreSQL connection string)

### 2. Environment Variables Setup

Create a `.env` file inside `backend/`:

```env
DATABASE_URL="postgresql://neondb_owner:password@ep-sample-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="sarkari_mitra_super_secret_jwt_key_2026"
ADMIN_EMAIL="admin@sarkarimitra.com"
ADMIN_PASSWORD="Admin@123456"
FRONTEND_URL="http://localhost:5173"
PORT=5001
NODE_ENV="development"
```

Create a `.env` file inside `frontend/` (optional for local dev):

```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Install Dependencies & Seed Database

Run from root directory:

```bash
# Install root monorepo dependencies
npm install

# Install backend dependencies & initialize database
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

Default Admin Credentials generated by seed script:
- **Email**: `admin@sarkarimitra.com`
- **Password**: `Admin@123456`

Sample Demo Exam Token generated by seed script:
- **Token**: `7f3c9a2e4b8d9c1a3e5f7a9b`

### 4. Running Development Servers

From root directory, execute:

```bash
npm run dev
```

This will run both frontend (Vite on `http://localhost:5173`) and backend (Express API on `http://localhost:5001`) concurrently.

Alternatively:
```bash
npm run dev:backend   # Starts backend server on http://localhost:5001
npm run dev:frontend  # Starts frontend server on http://localhost:5173
```

---

## 🌐 Vercel Deployment Guide

Both frontend and backend can be deployed on Vercel from the same repository as two separate Vercel projects.

### Deploying Backend on Vercel

1. Log in to Vercel and click **Add New Project**.
2. Import your GitHub repository.
3. In **Root Directory**, click **Edit** and set it to:
   ```text
   backend
   ```
4. Framework Preset: **Other**.
5. Build & Development Settings:
   - Build Command: `npx prisma generate`
   - Output Directory: Leave default.
6. Environment Variables:
   Add the following environment variables:
   - `DATABASE_URL`: Your NeonDB PostgreSQL connection string.
   - `JWT_SECRET`: A long random secret string.
   - `ADMIN_EMAIL`: `admin@sarkarimitra.com`
   - `ADMIN_PASSWORD`: Your admin password.
   - `FRONTEND_URL`: Your deployed frontend Vercel URL (e.g., `https://sarkari-mitra.vercel.app`).
   - `NODE_ENV`: `production`
7. Click **Deploy**. Note your backend production domain (e.g. `https://sarkari-mitra-api.vercel.app`).

### Deploying Frontend on Vercel

1. In Vercel, click **Add New Project** again.
2. Select the same GitHub repository.
3. In **Root Directory**, click **Edit** and set it to:
   ```text
   frontend
   ```
4. Framework Preset: **Vite**.
5. Build & Development Settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_URL`: `https://sarkari-mitra-api.vercel.app/api` (your backend Vercel API URL).
7. Click **Deploy**.

---

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: Admin password hashed with `bcryptjs` (salt rounds = 10).
2. **JWT Authentication**: Secure admin API endpoints protected with bearer token validation middleware.
3. **Information Concealment**: Student exam start & active exam APIs **never send `correctAnswer` or `explanation`** to the browser.
4. **Backend Score Calculation**: Results are computed strictly on the backend after submission.
5. **CORS & Helmet**: Security headers enforced via `helmet()` and CORS restricted to configured `FRONTEND_URL`.
