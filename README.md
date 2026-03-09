# ShiftTrack

> Warehouse Shift Management System — Sprint 2 Feature Development

**Live Demo:** https://shift-track.onrender.com

---

## Problem It Solves

Warehouse supervisors waste hours daily manually matching employee availability with the skills required by each operational area. ShiftTrack automates this process through a simple web interface that requires no technical training.

---

## Features

### Sprint 1 — MVP

| User Story | Feature | Status |
|------------|---------|--------|
| SC-17 | Secure login with JWT — lockout after 3 failed attempts, session expires in 8h | ✅ Complete |
| SC-10 | Employee registration with name, position and certified skills | ✅ Complete |
| SC-11 | Skills management — update employee skills with timestamp tracking | ✅ Complete |
| SC-12 | Shift creation with duplicate prevention | ✅ Complete |

### Sprint 2 — Feature Development

| User Story | Feature | Status |
|------------|---------|--------|
| SC-13 | Daily summary of all shifts grouped by area with coverage status | ✅ Complete |
| SC-14 | Filter available employees by skill and conflict-free schedule | ✅ Complete |
| SC-15 | Assign employee to shift with single-click conflict detection | ✅ Complete |
| SC-16 | Visual alerts for shifts with insufficient coverage | ✅ Complete |

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
│   │   ├── database.js         ← Sequelize + SQLite connection
│   │   └── seed.js             ← Default admin user + predefined skills
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   └── shiftController.js
│   ├── middleware/
│   │   └── authMiddleware.js   ← JWT authentication
│   ├── models/
│   │   ├── index.js            ← Relationships + Factory pattern
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
│       ├── css/
│       │   └── dashboard.css
│       └── js/
│           ├── auth.js
│           └── dashboard.js
├── tests/
│   └── unit/
│       ├── auth.test.js
│       ├── employees.test.js
│       ├── skills.test.js
│       ├── shifts.test.js
│       ├── summary.test.js
│       ├── availability.test.js
│       ├── assignment.test.js
│       └── alerts.test.js
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
PASS tests/unit/summary.test.js
PASS tests/unit/availability.test.js
PASS tests/unit/assignment.test.js
PASS tests/unit/alerts.test.js

Test Suites: 8 passed, 8 total
Tests:       21 passed, 21 total
```

---

## API Endpoints

All endpoints except `/api/auth/login` require a Bearer token in the Authorization header.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login, returns JWT token |

### Employees

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/employees` | Yes | List all employees with skills |
| POST | `/api/employees` | Yes | Register new employee |
| PUT | `/api/employees/:id/skills` | Yes | Update employee skills |

### Shifts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/shifts` | Yes | List all shifts |
| POST | `/api/shifts` | Yes | Create new shift |
| GET | `/api/shifts/summary` | Yes | Daily summary with coverage status per shift |
| GET | `/api/shifts/alerts` | Yes | Alerts for shifts with insufficient coverage |
| GET | `/api/shifts/:id/available-employees` | Yes | Available employees for a specific shift |
| POST | `/api/shifts/:id/assign` | Yes | Assign employee to shift |

### Example Requests

**Login:**
```bash
curl -X POST https://shift-track.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "ShiftTrack2026!"}'
```

**Create Shift:**
```bash
curl -X POST https://shift-track.onrender.com/api/shifts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-04-01", "start_time": "06:00", "end_time": "14:00", "operational_area": "Receiving"}'
```

**Assign Employee to Shift:**
```bash
curl -X POST https://shift-track.onrender.com/api/shifts/1/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"employeeId": 1}'
```

---

## CI/CD Pipeline

Every push and pull request triggers GitHub Actions automatically:

1. Installs dependencies
2. Runs the full test suite
3. Reports results

Render deploys automatically on every push to `main`.

---

## Git Workflow

Feature branch development used throughout both sprints:

```
main
 ├─ feature/app-architecture
 ├─ feature/SC-17-secure-login
 ├─ feature/SC-10-employee-registration
 ├─ feature/SC-11-skills-management
 ├─ feature/SC-12-shift-creation
 ├─ feature/SC-13-daily-summary
 ├─ feature/SC-14-filter-available-employees
 ├─ feature/SC-15-shift-assignment
 ├─ feature/SC-16-coverage-alerts
 ├─ feat/dashboard-full-ui
 ├─ docs/update-readme-sprint2
 ├─ fix/duplicate-import-employeeRoutes
 ├─ fix/jest-force-exit
 └─ fix/remove-duplicate-routes
```

---

## Known Limitations

- SQLite is not suitable for high concurrency — PostgreSQL migration planned for Sprint 3
- Free Render tier spins down after inactivity (first request may take ~30 seconds)

---

## Planned for Sprint 3

- PostgreSQL migration for production-grade database
- Employee availability scheduling
- Shift history and reporting

---