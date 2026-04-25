# CU Student Support Portal — Setup Guide (UPDATED)

## Step 1: Fix Your MongoDB Atlas (CRITICAL — Do This First)

Your database may have a broken index from failed seed runs. Fix it before anything else:

1. Open MongoDB Atlas → your cluster → **Browse Collections**
2. Open the `student-management` database → `users` collection
3. Click **Filter** and enter: `{ "uid": null }`
4. Delete any documents that appear
5. Go to **Indexes** tab → delete the old `uid_1` index if it exists
6. The new User model will recreate it correctly on next run

---

## Step 2: Create Your Backend `.env` File

Inside the `backend/` folder, create a file called `.env` (copy from `.env.example`):

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/student-management?retryWrites=true&w=majority
JWT_SECRET=pick_any_long_random_string_here_min32chars
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
PORT=5000
```

### How to get Gmail App Password (FREE — required for OTP emails):
1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** if not already enabled
3. Search for **"App passwords"**
4. Create a new App Password → select "Mail" and "Windows Computer"
5. Copy the 16-character password → paste as `SMTP_PASS`
6. Use your Gmail address as `SMTP_USER`

---

## Step 3: Seed the Database

```bash
cd backend
npm install
node seedAllDepartments.js
node seedWarden.js
node seedHigherAuthority.js
```

All seeded accounts use password: `Password@123`

### Management account emails:
- DSW: `dsw@cumail.in`
- Fee: `fee@cumail.in`
- IT Support: `it@cumail.in`
- Hostel: `hostel@cumail.in`
- Food: `food@cumail.in`
- Security: `security@cumail.in`

### Higher Authority accounts:
- `head.dsw@cumail.in`, `head.it@cumail.in`, etc.

---

## Step 4: Run Locally

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open: http://locallhost:5173

---

## Step 5: Fix Frontend API (IMPORTANT — REQUIRED FOR DEPLOYMENT)


### 

```js
const API = import.meta.env.VITE_API_URL;
```

---

### ✅ Example usage:

```js
const API = import.meta.env.VITE_API_URL;

fetch(`${API}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
});
```

---

## Step 6: Deploy Backend to Render (FREE)

1. Push your code to GitHub (`.env` must be in `.gitignore`)
2. Go to Render → **New Web Service**
3. Connect your GitHub repo

### Settings:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

### Add Environment Variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `SMTP_USER`
- `SMTP_PASS`

Deploy!

---

## Step 7: Deploy Frontend to Render (FREE)

1. Go to Render → **New Static Site**
2. Connect your GitHub repo

### Settings:

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

### Add Environment Variable:

```
VITE_API_URL=https://cu-student-support-portal.onrender.com
```

Deploy!

---

## Final Architecture

Frontend (Render Static Site)
        ↓
Backend (Render Web Service)
        ↓
MongoDB Atlas

---

## Bug Fixes Applied (Complete List)

| # | File | Fix |
|---|------|-----|
| 1 | `User.js` | Added `designation`; fixed schema issues |
| 2 | Seeders | Fixed null uid crash |
| 3 | `emailService.js` | Removed hardcoded credentials |
| 4 | `authController.js` | Consistent JWT handling |
| 5 | `authMiddleware.js` | Unified JWT usage |
| 6 | Validation | Email validation moved to controller |
| 7 | `complaintController.js` | Higher authority visibility fix |
| 8 | `chatHandler.js` | JWT socket authentication |
| 9 | `server.js` | Crash if DB not connected |
| 10 | `AuthContext.jsx` | Removed locallhost override |
| 11 | `Login.jsx` | Proper navigation fix |
| 12 | `Register.jsx` | OTP validation improved |
| 13 | `ComplaintForm.jsx` | UI improvement |
| 14 | `ComplaintDetails.jsx` | Socket auth fix |
| 15 | `ManagementDashboard.jsx` | UI improvements |
| 16 | `render.yaml` | Removed secrets |
| 17 | `seed-db.yml` | Manual trigger |
| 18 | `index.html` | Title updated |
| 19 | `App.jsx` | Catch-all route added |
| 20 | `ForgotPassword.jsx` | Improved validation |