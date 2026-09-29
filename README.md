# PRMCEAM College Event Portal

A simple role-based college event management web application built for the PRMCEAM Software Engineering Assessment.

## Features

### Authentication
- Separate Admin Register/Login and Student Register/Login pages.
- JWT-based authentication.
- Passwords are hashed with bcrypt.
- Role-based dashboard routing.

### Admin
- Create events with name, date, time and maximum seats.
- View all created events.
- See registered attendee count and remaining seats.
- View the attendee list for each event.

### Student
- View upcoming events.
- See remaining seats.
- Register for an event.
- Cannot register when seats are full.
- Cannot register for the same event more than once.

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT + bcryptjs

## Project Structure

```text
college-event-portal/
├── backend/
│   ├── middleware/auth.js
│   ├── models/User.js
│   ├── models/Event.js
│   ├── models/Registration.js
│   ├── routes/auth.js
│   ├── routes/events.js
│   ├── routes/registrations.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── .env.example
└── README.md
```

## 1. Requirements

Install:
- Node.js 18+
- npm
- MongoDB Atlas account (recommended) or a local MongoDB server
- Git

Check Node/npm:

```bash
node -v
npm -v
```

## 2. Configure the backend

Open a terminal:

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/college_events
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Then start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

## 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start React:

```bash
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

## 4. First-time test

1. Open the application.
2. Choose Admin Register and create an admin account.
3. Login as Admin.
4. Create an event.
5. Logout.
6. Choose Student Register and create a student account.
7. Login as Student.
8. Register for the event.
9. Return to Admin and check the attendee count.

## Test credentials

The application does not hard-code a password. Create test accounts through the Register pages.

Example:

```text
Admin:
Email: admin@test.com
Password: Admin@123

Student:
Email: student@test.com
Password: Student@123
```

Do not use these example credentials in production unless you create them yourself.

## Business rules implemented

- Event name, date, time and maximum capacity are required.
- Maximum seats must be greater than zero.
- Remaining seats = maximum seats - registered students.
- Registration is blocked when remaining seats are zero.
- A student cannot register for the same event twice.
- No waitlist.
- No certificate generation.
- No approval workflow.
- No multi-day event handling.

## API summary

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Events

```text
GET  /api/events
POST /api/events
GET  /api/events/:id/attendees
```

### Registrations

```text
POST /api/registrations/:eventId
GET  /api/registrations/my
```

## Deployment

### Backend on Render

Create a new Web Service using the `backend` directory.

Build command:

```text
npm install
```

Start command:

```text
npm start
```

Environment variables:

```text
MONGODB_URI=your MongoDB Atlas URI
JWT_SECRET=your secret
CLIENT_URL=https://your-frontend-domain.vercel.app
PORT=10000
```

### Frontend on Vercel

Import the GitHub repository and set the root directory to:

```text
frontend
```

Build command:

```text
npm run build
```

Environment variable:

```text
VITE_API_URL=https://your-backend.onrender.com/api
```

After deployment, update the backend `CLIENT_URL` to the actual Vercel URL.

## GitHub submission

From the project root:

```bash
git init
git add .
git commit -m "Build college event portal"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/college-event-portal.git
git push -u origin main
```

Then submit:
1. Public GitHub repository URL
2. Live frontend URL
3. README with setup instructions
4. Test credentials

## Short explanation for the assessment

The project uses React for the user interface, Express and Node.js for REST APIs, MongoDB for storing users/events/registrations, bcrypt for password hashing, and JWT for authentication. Users have either an Admin or Student role. Admins create events and monitor registrations, while students view upcoming events and register while seats are available. A unique student-event registration prevents duplicate registrations.
