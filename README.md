# Pizza Palace — Full-Stack Pizza Delivery App

A production-style MERN app (MongoDB, Express, React, Node.js) with a custom pizza
builder, Razorpay checkout (test mode), real-time order tracking, and an admin
panel with automated low-stock email alerts.

## What's implemented

**User side**
- Registration with email verification link
- JWT-based login
- Forgot password → email reset link → set new password
- Pizza builder: base → sauce → cheese → veggies (multi-select) → review
- Cart + order summary before payment
- Razorpay checkout (test mode — click **Success** in the test modal to confirm payment)
- Real-time-ish order status tracking (polls every 5s): Order Received → In Kitchen → Sent to Delivery → Delivered

**Admin side**
- Separate admin login (`/admin/login`, not reachable from user registration)
- Inventory dashboard grouped by base / sauce / cheese / veggie, with live stock
- Manual stock update per item
- Stock is automatically decremented after every paid order
- Automated email alert to the admin when any item drops below its configurable
  threshold, via a `node-cron` job that runs every 30 minutes
- Order management panel: view all paid orders, update status per order (polls
  every 7s so changes are reflected on the user's tracker)

## Tech stack

- **Frontend:** React 18 + Vite + React Router + Tailwind CSS + Axios
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Payments:** Razorpay (test mode)
- **Email:** Nodemailer (SMTP)
- **Scheduled jobs:** node-cron

## Project structure

```
pizza-delivery-app/
  backend/
    config/db.js            MongoDB connection
    models/                 User, PizzaOption, Order, Inventory
    middleware/auth.js      JWT verification + admin guard
    controllers/            auth, pizza options, orders, payments, admin
    routes/                 REST endpoints
    utils/
      sendEmail.js          Nodemailer wrapper
      generateToken.js      JWT signing
      cronJobs.js           Low-stock alert scheduler
      seedData.js           Seeds pizza options, inventory, and a default admin
    server.js
  frontend/
    src/
      pages/                Register, Login, ForgotPassword, ResetPassword,
                             VerifyEmail, Dashboard, admin/AdminLogin, admin/AdminDashboard
      components/           Navbar, ProtectedRoute, AuthCard, PizzaBuilder, OrderTracker
      context/AuthContext.jsx
      api/axios.js
```

## Setup

### 1. Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)
- A Razorpay account in **test mode** (free) → dashboard.razorpay.com → Settings → API Keys
- An email account for SMTP (e.g. Gmail with an **App Password**, not your normal password)

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MongoDB URI, JWT secret, Razorpay test keys, and SMTP creds

npm run seed   # populates pizza options + inventory + creates a default admin
npm run dev    # starts the API on http://localhost:5000
```

Default admin created by the seed script (change the password after first login):
```
email: value of ADMIN_EMAIL in .env (default admin@pizzapalace.com)
password: Admin@123
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL should point at your backend, e.g. http://localhost:5000/api

npm run dev    # starts the app on http://localhost:5173
```

### 4. Try it out
1. Register a user at `/register` → check your inbox for the verification email → click the link.
2. Log in, build a pizza, add it to the cart, and check out.
3. In the Razorpay test checkout modal, use test card `4111 1111 1111 1111`,
   any future expiry, any CVV — or just click through to "Success".
4. Watch the order tracker update as you (as admin) move it through statuses.
5. Log in at `/admin/login` with the seeded admin account to manage inventory
   and orders. Drop any item's stock below its threshold and wait for the
   next cron tick (or lower the schedule in `utils/cronJobs.js` while testing)
   to see the low-stock email fire.

## Notes on scope
This is a complete, working reference implementation of every checklist item
in the brief. A few things you'd want to harden before production: rate
limiting on auth routes, refresh tokens, input validation middleware (e.g.
Zod/Joi), image uploads for pizza options, and HTTPS/CORS lockdown for a real
deployment domain.
