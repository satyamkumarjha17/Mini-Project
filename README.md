# Student Support Portal 🎓

## Overview

The Student Support Portal is a web-based application designed to manage student queries and complaints efficiently. Students can raise tickets, and administrators can track, manage, and resolve them within a defined SLA (Service Level Agreement) time.

The system ensures structured communication, faster issue resolution, and accountability.

---

## Objectives

* Provide a centralized platform for student issues
* Track and manage tickets efficiently
* Enforce SLA-based resolution time
* Improve transparency between students and administration

---

## Features

### User Features

* User Registration and Login (secure authentication using bcrypt)
* Raise new support tickets
* View ticket status (Open / In Progress / Resolved)
* Track SLA countdown for each ticket

### Admin Features

* View all tickets
* Update ticket status
* Monitor SLA deadlines
* Manage users and complaints

---

## Tech Stack

| Layer    | Technology Used               |
| -------- | ----------------------------- |
| Frontend | HTML, CSS, JavaScript / React |
| Backend  | Node.js, Express.js           |
| Database | MySQL                         |
| Security | bcrypt (password hashing)     |
| Tools    | Git, GitHub, Postman, Nodemon |

---

## System Architecture

Client (Frontend) → API Requests → Express Server → Controllers → MySQL Database → Response to Client

---

## Project Structure

```id="8y2k9n"
project-root/
│
├── frontend/                 # UI (React or static)
├── backend/
│   ├── routes/               # API route definitions
│   ├── controllers/          # Business logic
│   ├── models/               # Database queries
│   ├── config/               # DB connection
│   └── server.js             # Entry point
│
├── database/
│   └── schema.sql            # Tables (users, tickets)
│
├── package.json
└── README.md
```

---

## Installation & Setup

### 1. Clone Repository

```id="p9x2ld"
git clone https://github.com/your-username/student-support-portal.git
cd student-support-portal
```

### 2. Backend Setup

```id="x0k3vn"
cd backend
npm install
npm run dev
```

### 3. Database Setup (MySQL)

* Create a new database (e.g., `student_portal`)
* Import `schema.sql`
* Update DB credentials in config file

### 4. Frontend Setup

```id="9rm1dl"
cd frontend
npm install
npm start
```

---

## Usage

1. Open browser at: Not Live now (I will update this later)
2. Register or login as a user
3. Create a support ticket
4. Track status and SLA timer
5. Admin can manage and resolve tickets

---

## API Endpoints

### Authentication

* POST `/api/auth/register` → Register user
* POST `/api/auth/login` → Login user

### Ticket Management

* POST `/api/tickets` → Create ticket
* GET `/api/tickets` → Fetch all tickets
* GET `/api/tickets/:id` → Fetch ticket by ID
* PUT `/api/tickets/:id` → Update ticket status

---

## SLA Timer (Core Logic)

Each ticket is associated with a predefined resolution time.

System tracks:

* Ticket creation timestamp
* SLA deadline
* Remaining time

If SLA is exceeded:

* Ticket can be flagged as overdue
* Admin is expected to prioritize resolution

---

## Security Implementation

* Password hashing using bcrypt
* Input validation at API level
* Separation of concerns (routes, controllers, models)

---

## Advantages

* Organized issue management
* Faster resolution through SLA tracking
* Scalable backend architecture
* Secure authentication system

---

## Limitations

* No email notification system (currently)
* No role-based authorization (basic level only)
* UI can be further improved

---

## Future Enhancements

* Email/SMS notifications
* Role-based access control (RBAC)
* Priority-based ticket handling
* Dashboard analytics
* Deployment on cloud (AWS / Render / Railway)

---

## Author

Satyam Kumar Jha

---

