# Hostel Activity Management System

A Full Stack MERN Application for managing hostel activities, student registrations, attendance tracking, and admin reporting.

---

# Features

## Authentication & Authorization
- JWT-based Authentication
- Role-Based Access Control
- Student, Attender, Admin, Super Admin Roles

## Student Features
- View Activities
- Register for Activities
- Track Participation

## Attender Features
- View Student Registrations
- Mark Attendance
- Present/Absent Validation

## Admin Features
- View Reports
- Attendance Analytics
- Participation Statistics

---

# Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

---

# Project Structure

```bash
hostel-activity-system/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── routes/
│   │   └── services/
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone <your-repository-url>
```

---

# Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# Environment Variables

Create `.env` file inside backend folder.

```env
PORT=3000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

# API Modules

## Authentication
- Register User
- Login User
- JWT Verification

## Activities
- Create Activity
- View Activities

## Registration
- Register for Activity
- View Registrations

## Attendance
- Mark Attendance
- View Attendance

## Reports
- Daily Reports
- Attendance Statistics

---

# Future Enhancements
- QR Attendance
- PDF Report Export
- Activity Images
- Notifications
- Mobile Responsive UI
- Charts & Analytics

---

# Author

Likhith Rao K