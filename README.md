# ShiftTrack

> Warehouse Shift Management System — Full Capstone Project

**Live Demo:** https://shift-track.onrender.com

---

## Problem It Solves

Warehouse supervisors waste hours daily manually matching employee availability with the skills required by each operational area. ShiftTrack automates this process through a simple web interface that requires no technical training. A supervisor can log in, register employees with their certified skills, create shifts, assign personnel, and receive real-time coverage alerts — all in under three clicks per action.

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

### Sprint 3 — Testing and Deployment

| User Story | Feature | Status |
|------------|---------|--------|
| SC-19 | Full flow integration tests covering login → registration → shift → assignment | ✅ Complete |
| SC-20 | Manual system testing with real users — all scenarios pass in ≤ 3 clicks | ✅ Complete |
| SC-21 | CI/CD pipeline configured in GitHub Actions with automatic Render deployment | ✅ Complete |
| SC-22 | Final repository documentation with design patterns and testing strategy | ✅ Complete |

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

### MVC (Model-View-Controller)
Separates the application into three independent layers:
- **Model:** Sequelize models (`Employee`, `Skill`, `Shift`, `User`) handle all data access and relationships
- **View:** HTML files in `src/views/` served by Express as static responses
- **Controller:** Business logic in `src/controllers/` processes requests and returns responses

**Rationale:** Keeps concerns separated so each layer can be tested, modified, and scaled independently without affecting the others.

### Factory Pattern
The `createUser()` function in `src/models/index.js` encapsulates the bcrypt hashing logic required to create a valid user record.

**Rationale:** Prevents raw password storage by centralizing the hashing concern in one reusable function, reducing the risk of misuse across the codebase.

### Observer Pattern
The `skills_updated_at` timestamp on the `Employee` model is updated every time an employee's skills are modified via the SC-11 endpoint.

**Rationale:** Acts as a passive signal to external systems or future features that a skill change occurred, without requiring them to poll or compare records.

---

## Testing Strategy

ShiftTrack follows a **Test-Driven Development (TDD)** approach across all three sprints of the SDLC.

### Approach
Each feature was implemented following the Red → Green → Refactor cycle:
1. Write a failing test **(Red)**
2. Implement the minimum code to make it pass **(Green)**
3. Clean up without breaking tests **(Refactor)**

### Test Types

| Type | Location | Tests | Purpose |
|------|----------|-------|---------|
| Unit | `tests/unit/` | 21 | Test individual API endpoints in isolation |
| Integration | `tests/integration/` | 7 | Test the full workflow end-to-end across all layers |
| Manual | Performed on production URL | 11 scenarios | Validate UX and non-functional requirements |

### Tools
- **Jest** — Test runner with `--runInBand` and `--forceExit` flags
- **Supertest** — HTTP assertions against the live Express app
- **`sequelize.sync({ force: true })`** — Ensures a clean database state for each test suite

### CI Integration
GitHub Actions runs the full test suite on every push and pull request. Unit tests and integration tests run in separate steps for clear failure reporting. Render deployment is blocked automatically if any test fails.

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
│   ├── unit/
│   │   ├── auth.test.js
│   │   ├── employees.test.js
│   │   ├── skills.test.js
│   │   ├── shifts.test.js
│   │   ├── summary.test.js
│   │   ├── availability.test.js
│   │   ├── assignment.test.js
│   │   └── alerts.test.js
│   └── integration/
│       └── fullFlow.test.js
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
# Run all tests
npm test

# Run only unit tests
npm test -- --testPathPatterns='tests/unit'

# Run only integration tests
npm test -- --testPathPatterns='tests/integration'
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
PASS tests/integration/fullFlow.test.js

Test Suites: 9 passed, 9 total
Tests:       28 passed, 28 total
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
2. Runs unit tests (`tests/unit/`)
3. Runs integration tests (`tests/integration/`)
4. Reports results

Render deploys automatically on every push to `main` only when all tests pass.

---

## Git Workflow

Feature branch development used throughout all three sprints:

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
 ├─ feature/SC-19-integration-tests
 ├─ feature/SC-20-system-testing
 ├─ feature/SC-21-cicd-final
 ├─ docs/SC-22-final-documentation
 ├─ feat/dashboard-full-ui
 ├─ fix/duplicate-import-employeeRoutes
 ├─ fix/jest-force-exit
 ├─ fix/jest-testpathpatterns-flag
 └─ fix/remove-duplicate-routes
```

---

## Known Limitations

- SQLite is not suitable for high concurrency — PostgreSQL migration recommended for production scale
- Free Render tier spins down after inactivity — first request may take ~30 seconds to respond