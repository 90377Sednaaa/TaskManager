# Task Manager

A team task and workload manager built with **Laravel** (API backend) and **React + TypeScript + MUI** (frontend). Admins can create tasks and assign them to one or more employees; employees can update task status, adjust progress, and log notes on what they've achieved.

Roles (Admin / Employee) are handled with **Spatie Laravel Permission**. Since there's no login system yet, the app uses a "View as: Admin | Employee" toggle to switch between the two experiences.

---

## Tech Stack

- **Backend:** Laravel 11+, MySQL, Spatie Laravel Permission
- **Frontend:** React 18, TypeScript, Vite, Material UI (MUI), Axios, Recharts

---

## Prerequisites

Before you start, make sure you have installed:

- PHP 8.2+ and Composer
- Node.js 18+ and npm
- MySQL (via XAMPP, Laragon, or standalone)

---

## Project Structure

```
TaskManager/
├── backend/                          Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── TaskController.php    Task CRUD, status updates, logs
│   │   │   └── UserController.php    List employees
│   │   └── Models/
│   │       ├── Task.php              belongsToMany Users, hasMany TaskLogs
│   │       ├── TaskLog.php           Update/history entries per task
│   │       └── User.php              HasRoles (Spatie), belongsToMany Tasks
│   ├── database/
│   │   ├── migrations/               tasks, task_user, task_logs, Spatie tables
│   │   └── seeders/
│   │       └── RoleAndUserSeeder.php Creates admin/employee roles + test users
│   ├── routes/
│   │   └── api.php                   All API endpoints
│   └── .env                          Database connection config
│
└── frontend/                         React app
    └── src/
        ├── api/
        │   ├── client.ts             Axios instance (baseURL to Laravel)
        │   └── tasks.ts              All API call functions
        ├── components/
        │   └── Layout.tsx            Top bar + sidebar (responsive)
        ├── pages/
        │   ├── AdminDashboardStats.tsx   Admin dashboard (charts, stats)
        │   ├── CreateTaskPage.tsx        Admin: create task form
        │   ├── ViewTasksPage.tsx         Admin: task cards, edit/delete, logs
        │   ├── EmployeeDashboard.tsx     Employee dashboard (own stats)
        │   └── EmployeeBoard.tsx         Employee: "My Work" board
        ├── types/
        │   └── index.ts               TypeScript interfaces (Task, User, TaskLog)
        ├── App.tsx                    Top-level state, routes between pages
        └── main.tsx                   React root + MUI CssBaseline
```

---

## Setup

### 1. Database

Create an empty MySQL database (e.g. `task_manager`) via phpMyAdmin or your DB tool of choice.

### 2. Backend (Laravel)

```bash
cd backend
composer install
```

Copy `.env.example` to `.env` if it doesn't already exist, then set your database credentials:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_manager
DB_USERNAME=root
DB_PASSWORD=
```

Generate the app key, run migrations, and seed roles/test users:

```bash
php artisan key:generate
php artisan migrate
php artisan db:seed
```

This creates 4 test users (login isn't wired up yet, so these are just data records):

| Name | Email | Role |
|---|---|---|
| Admin User | admin@example.com | admin |
| Alice Employee | alice@example.com | employee |
| Bob Employee | bob@example.com | employee |
| Carla Employee | carla@example.com | employee |

Start the backend server:

```bash
php artisan serve
```

Runs at `http://127.0.0.1:8000`.

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`. The frontend is pre-configured to call the backend at `http://127.0.0.1:8000/api` (see `src/api/client.ts`) — update that if your backend runs elsewhere.

**Both servers must be running at the same time**, each in its own terminal.

---

## Common Commands

**Backend**
```bash
php artisan serve              # start the API server
php artisan migrate            # run migrations
php artisan migrate:fresh --seed   # reset DB and reseed (careful — wipes data)
php artisan tinker             # interactive shell to test models/queries
```

**Frontend**
```bash
npm run dev                    # start dev server with hot reload
npm run build                  # production build
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/users` | List employees (for assignment dropdowns) |
| GET | `/api/tasks` | List all tasks with assigned users |
| POST | `/api/tasks` | Create a task, assign employees |
| PUT | `/api/tasks/{id}` | Edit a task's title/description/assignees |
| DELETE | `/api/tasks/{id}` | Delete a task |
| GET | `/api/my-tasks/{userId}` | Tasks assigned to one employee |
| PATCH | `/api/tasks/{id}/status` | Update status/progress, logs the change |
| GET | `/api/tasks/{id}/logs` | Full update history for one task |

---

## How the App Works

- **Admin view** (toggle top-right): Dashboard (stats + charts), Create Task (form with multi-select), View Tasks (card grid, click to see details/logs, edit/delete).
- **Employee view**: pick "Viewing as" (stand-in for login) → Dashboard (personal stats) or My Work (task cards with Start/Halt/Complete buttons and a full update dialog for progress + notes).
- Every status/progress update writes a row to `task_logs`, building a permanent history per task — visible in both the Admin's task detail dialog and the Employee's update dialog.
- Progress and status are auto-linked: setting progress to 100 marks the task completed, and marking a task completed sets progress to 100.

---

## Known Limitations (MVP scope)

- No real authentication — the "View as" toggle and "Viewing as" dropdown simulate roles/identity.
- `created_by` on new tasks is currently hardcoded to the seeded Admin user (id `1`).
- No pagination — fine for demo data, would need adding for large task lists.
