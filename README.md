# Task Manager

A team task and workload manager built with **Laravel** (API backend) and **React + TypeScript + MUI** (frontend). Admins can create tasks and assign them to one or more employees; employees can update task status, adjust progress, and log notes on what they've achieved.

Roles (Admin / Employee) are handled with **Spatie Laravel Permission**. Authentication is handled with **Laravel Sanctum** (token-based) — users log in or sign up, and every account created through the public signup form is automatically given the Employee role. Admin accounts are created manually (see below), never through public signup, for security reasons.

---

## Tech Stack

- **Backend:** Laravel 11+, MySQL, Spatie Laravel Permission, Laravel Sanctum
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
│   │   │   ├── AuthController.php    Register, login (issues Sanctum tokens)
│   │   │   ├── TaskController.php    Task CRUD, status updates, logs
│   │   │   └── UserController.php    List employees
│   │   └── Models/
│   │       ├── Task.php              belongsToMany Users, hasMany TaskLogs
│   │       ├── TaskLog.php           Update/history entries per task
│   │       └── User.php              HasRoles (Spatie), HasApiTokens (Sanctum), belongsToMany Tasks
│   ├── database/
│   │   ├── migrations/               tasks, task_user, task_logs, Spatie tables, personal_access_tokens
│   │   └── seeders/
│   │       └── RoleAndUserSeeder.php Creates admin/employee roles + test users (idempotent, safe to re-run)
│   ├── routes/
│   │   └── api.php                   All API endpoints
│   └── .env                          Database connection config
│
└── frontend/                         React app
    └── src/
        ├── api/
        │   ├── client.ts              Axios instance (baseURL + auto-attaches auth token)
        │   ├── auth.ts                login() / register() calls
        │   └── tasks.ts               All task/user API call functions
        ├── context/
        │   └── AuthContext.tsx        Global logged-in user/token state (React Context)
        ├── components/
        │   └── Layout.tsx             Top bar + sidebar (responsive)
        ├── pages/
        │   ├── LoginPage.tsx              Login form
        │   ├── SignupPage.tsx             Signup form (always creates Employee accounts)
        │   ├── AdminDashboardStats.tsx    Admin dashboard (charts, stats)
        │   ├── CreateTaskPage.tsx         Admin: create task form
        │   ├── ViewTasksPage.tsx          Admin: task cards, edit/delete, logs
        │   ├── EmployeeDashboard.tsx      Employee dashboard (own stats)
        │   └── EmployeeBoard.tsx          Employee: "My Work" board
        ├── types/
        │   └── index.ts                TypeScript interfaces (Task, User, TaskLog, AuthResponse)
        ├── App.tsx                     Auth gate (login/signup vs. real app) + top-level page state
        └── main.tsx                    React root, MUI theme, AuthProvider wrapper
```

---

## Setup

### 0. XAMPP setup (Windows)

If you are using XAMPP, clone this project into your web root so it lives at:

- `D:\xampp\htdocs\TaskManager`
- or `C:\xampp\htdocs\TaskManager`

Make sure **Apache** and **MySQL** are running in the XAMPP Control Panel before you continue. (Apache is only needed if you're serving the app through XAMPP's own web server — if you're using `php artisan serve` as described below, Apache isn't strictly required, but MySQL must be running either way.)

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

This creates test accounts you can use to sign in immediately (all use the password `password`):

| Name           | Email             | Role     |
| -------------- | ----------------- | -------- |
| Admin User     | admin@example.com | admin    |
| Alice Employee | alice@example.com | employee |
| Bob Employee   | bob@example.com   | employee |
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

## Creating an Admin Account

Public signup (`/register`) always creates **Employee** accounts — this is intentional, so a random visitor can't grant themselves Admin access. There are three ways to create an Admin account:

### Option A — use the existing seeded admin

The seeder already creates one ready-to-use admin account:

```
Email: admin@example.com
Password: password
```

Just log in with it directly — no extra steps needed.

### Option B — add more admins via the seeder

Open `backend/database/seeders/RoleAndUserSeeder.php`. Find the admin creation block:

```php
$admin = User::firstOrCreate(
    ['email' => 'admin@example.com'],
    ['name' => 'Admin User', 'password' => bcrypt('password')]
);
$admin->assignRole($adminRole);
```

Replace it with a loop, the same way the employee list already works, so you can add as many admins as you need:

```php
$admins = [
    ['name' => 'Admin User', 'email' => 'admin@example.com'],
    ['name' => 'Your Name', 'email' => 'youremail@example.com'],
];

foreach ($admins as $adminData) {
    $adminUser = User::firstOrCreate(
        ['email' => $adminData['email']],
        ['name' => $adminData['name'], 'password' => bcrypt('password')]
    );
    $adminUser->assignRole($adminRole);
}
```

Then re-run just this seeder:

```bash
php artisan db:seed --class=RoleAndUserSeeder
```

This is safe to run repeatedly — existing users are found and skipped (via `firstOrCreate`), only genuinely new emails get created, so you won't get duplicate-entry errors.

### Option C — promote an existing account via Tinker

If someone already signed up as an Employee and needs to become an Admin:

```bash
php artisan tinker
```

```php
$user = App\Models\User::where('email', 'someone@example.com')->first();
$user->syncRoles(['admin']); // removes their old role(s) and assigns admin only
```

---

## Common Commands

**Backend**

```bash
php artisan serve                   # start the API server
php artisan migrate                 # run migrations
php artisan migrate:fresh --seed    # reset DB and reseed (careful — wipes data)
php artisan db:seed --class=RoleAndUserSeeder   # re-run just the role/user seeder
php artisan tinker                  # interactive shell to test models/queries
```

**Frontend**

```bash
npm run dev                         # start dev server with hot reload
npm run build                       # production build
```

---

## API Endpoints

| Method | Endpoint                 | Purpose                                   | Auth required |
| ------ | ------------------------ | ----------------------------------------- | ------------- |
| POST   | `/api/register`          | Create an account (always Employee role)  | No            |
| POST   | `/api/login`             | Log in, returns user + token              | No            |
| GET    | `/api/users`             | List employees (for assignment dropdowns) | Yes           |
| GET    | `/api/tasks`             | List all tasks with assigned users        | Yes           |
| POST   | `/api/tasks`             | Create a task, assign employees           | Yes           |
| PUT    | `/api/tasks/{id}`        | Edit a task's title/description/assignees | Yes           |
| DELETE | `/api/tasks/{id}`        | Delete a task                             | Yes           |
| GET    | `/api/my-tasks/{userId}` | Tasks assigned to one employee            | Yes           |
| PATCH  | `/api/tasks/{id}/status` | Update status/progress, logs the change   | Yes           |
| GET    | `/api/tasks/{id}/logs`   | Full update history for one task          | Yes           |

`/api/register` and `/api/login` are both rate-limited (`throttle:5,1` — 5 attempts per minute per IP) to slow down brute-force attempts.

---

## How the App Works

- **Not logged in:** shows the Login page. New users can switch to Signup to create an Employee account.
- **Logged in as Admin:** Dashboard (stats + charts), Create Task (form with multi-select), View Tasks (card grid, click to see details/logs, edit/delete).
- **Logged in as Employee:** Dashboard (personal stats) or My Work (task cards with Start/Halt/Complete buttons and a full update dialog for progress + notes).
- On login/signup, the backend issues a Sanctum token, which the frontend stores in `localStorage` and automatically attaches to every subsequent API request via an Axios interceptor.
- Every status/progress update writes a row to `task_logs`, building a permanent history per task — visible in both the Admin's task detail dialog and the Employee's update dialog.
- Progress and status are auto-linked: setting progress to 100 marks the task completed, and marking a task completed sets progress to 100.

---

## Known Limitations (MVP scope)

- `created_by` on new tasks is currently hardcoded to the seeded Admin user (id `1`) rather than using the actual logged-in admin's ID.
- No password reset / "forgot password" flow yet.
- No pagination — fine for demo data, would need adding for large task lists.
- No route-level role middleware yet (e.g. `role:admin` on task-management routes) — currently any authenticated user could call admin-only endpoints directly via the API, even though the UI hides those actions from employees. Should be added before this goes anywhere beyond local development.
