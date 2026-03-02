# ShiftTrack

> Warehouse Shift Management System — Sprint 1 MVP

**Live Demo:** https://shift-track.onrender.com ← replace with your Render URL

---

## Problem It Solves

Warehouse supervisors waste hours daily manually matching employee availability with the skills required by each operational area. ShiftTrack automates this process through a simple web interface that requires no technical training.

---

## Features — Sprint 1 MVP

| User Story | Feature | Status |
|------------|---------|--------|
| SC-17 | Secure login with JWT — lockout after 3 failed attempts, session expires in 8h | ✅ Complete |
| SC-10 | Employee registration with name, position and certified skills | ✅ Complete |
| SC-11 | Skills management — update employee skills with timestamp tracking | ✅ Complete |
| SC-12 | Shift creation with duplicate prevention | ✅ Complete |

---

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** SQLite + Sequelize ORM
- **Frontend:** HTML, CSS, JavaScript
- **Testing:** Jest + Supertest
- **Deployment:** Render.com
- **CI/CD:** GitHub Actions

---

## Design Patterns

- **MVC:** Routes → Controllers → Models separation
- **Factory:** `createUser()` encapsulates password hashing logic
- **Observer:** `skills_updated_at` timestamp notifies matching engine of skill changes

---

## Project Structure

```
shift-track/
├── src/
│   ├── config/
│   │   ├── database.js       ← Sequelize + SQLite connection
│   │   └── seed.js           ← Default admin user + predefined skills
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   └── shiftController.js
│   ├── middleware/
│   │   └── authMiddleware.js ← JWT authentication
│   ├── models/
│   │   ├── index.js          ← Relationships + Factory pattern
│   │   ├── Employee.js
│   │   ├── Skill.js
│   │   ├── Shift.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   └── shiftRoutes.js
│   ├── views/
│   │   ├── login.html
│   │   └── dashboard.html
│   └── public/
│       └── js/
│           └── auth.js
├── tests/
│   └── unit/
│       ├── auth.test.js
│       ├── employees.test.js
│       ├── skills.test.js
│       └── shifts.test.js
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json
├── server.js
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/velatop/shift-track.git
cd shift-track

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your values
```

### Environment Variables

```bash
PORT=3000
JWT_SECRET=your_secret_key_here
SESSION_TIMEOUT=28800000
NODE_ENV=development
```

### Run the seed (creates default admin user and skills)

```bash
npm run seed
```

### Start development server

```bash
npm run dev
```

App will be running at `http://localhost:3000`

---

## Default Credentials

After running the seed:

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `ShiftTrack2026!` |

---

## Running Tests

```bash
npm test
```

Expected output:
```
PASS tests/unit/auth.test.js
PASS tests/unit/employees.test.js
PASS tests/unit/skills.test.js
PASS tests/unit/shifts.test.js

Test Suites: 4 passed, 4 total
Tests:       12 passed, 12 total
```

---

## API Endpoints

All endpoints except `/api/auth/login` require a Bearer token in the Authorization header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login, returns JWT token |
| GET | `/api/employees` | Yes | List all employees with skills |
| POST | `/api/employees` | Yes | Register new employee |
| PUT | `/api/employees/:id/skills` | Yes | Update employee skills |
| GET | `/api/shifts` | Yes | List all shifts |
| POST | `/api/shifts` | Yes | Create new shift |

### Example Requests

**Login:**
```bash
curl -X POST https://shift-track.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "ShiftTrack2026!"}'
```
---

## CI/CD Pipeline

Every push and pull request triggers GitHub Actions automatically:

1. Installs dependencies
2. Runs the full test suite
3. Reports results

Render deploys automatically on every push to `main` only if the build succeeds.

---

## Git Workflow

Feature branch development was used throughout Sprint 1:

```
main
 ├─ feature/app-architecture
 ├─ feature/SC-17-secure-login
 ├─ feature/SC-10-employee-registration
 ├─ feature/SC-11-skills-management
 ├─ feature/SC-12-shift-creation
 ├─ feature/production-seed-config
 ├─ feat/add-dashboard-placeholder
 ├─ fix/duplicate-import-employeeRoutes
 ├─ fix/jest-force-exit
 └─ fix/github-actions-all-branches
```

---

## Known Limitations
- Dashboard is a placeholder — full UI coming in Sprint 2

---

## Planned for Sprint 2

- Full dashboard with employee and shift management UI
- Shift assignment with skill-based matching engine
- Daily coverage summary
- Employee availability filtering