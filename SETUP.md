# CU Student Support Portal — Setup Guide

## Step 1: Fix Your MongoDB Atlas (CRITICAL — Do This First)

Your database has a broken index from failed seed runs. Fix it before anything else:

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
3. Search for **"App passwords"** in the search bar
4. Create a new App Password → select "Mail" and "Windows Computer"
5. Copy the 16-character password → paste as `SMTP_PASS`
6. Use your full Gmail address as `SMTP_USER`

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
- (see seeders for full list)

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

Open: http://localhost:5173

---

## Step 5: Deploy to Render (FREE)

1. Push your code to GitHub (make sure `.env` is in `.gitignore` ✅)
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set **Build Command**: `npm run build`
5. Set **Start Command**: `npm start`
6. Under **Environment Variables**, add all 4 variables manually:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `SMTP_USER`
   - `SMTP_PASS`
7. Deploy!

---

## Bug Fixes Applied (Complete List)

| # | File | Fix |
|---|------|-----|
| 1 | `User.js` | Added `designation` field; removed email validator that broke upserts |
| 2 | All seeders | Fixed `null` uid crash with `$set`, `returnDocument`, and pre-cleanup |
| 3 | `emailService.js` | Removed hardcoded credentials; fails loudly if env vars missing |
| 4 | `authController.js` | Removed JWT fallback secret; consistent `signToken` helper |
| 5 | `authMiddleware.js` | Uses same JWT secret path; no fallback |
| 6 | `authController.js` | Email domain validation moved to code (not schema); works with upserts |
| 7 | `complaintController.js` | `higher_authority` sees escalated complaints; status validation added |
| 8 | `chatHandler.js` | JWT authentication on every socket connection; senderId from token |
| 9 | `server.js` | Crashes loudly if `MONGODB_URI` missing instead of silently failing |
| 10 | `AuthContext.jsx` | Removed hardcoded `localhost` baseURL override inside component |
| 11 | `Login.jsx` | OTP login uses `navigate()` instead of `window.location.href` |
| 12 | `Register.jsx` | Passes `type` to OTP endpoint for email domain validation |
| 13 | `ComplaintForm.jsx` | Replaced `prompt()` with inline text input for custom department |
| 14 | `ComplaintDetails.jsx` | Socket sends JWT token; connected badge reflects real socket state |
| 15 | `ManagementDashboard.jsx` | `higher_authority` UI label and escalated row highlighting |
| 16 | `render.yaml` | Credentials removed; uses `sync: false` (enter in Render dashboard) |
| 17 | `seed-db.yml` | Changed to manual trigger only; uses GitHub Secrets for MONGODB_URI |
| 18 | `index.html` | Title changed from "frontend" to "CU Student Support Portal" |
| 19 | `App.jsx` | Added catch-all `*` route redirect |
| 20 | `ForgotPassword.jsx` | Added password confirmation field; cleaner error messages |
