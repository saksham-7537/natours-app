🌍 Natours – Full Stack Tour Booking Application

Natours is a full-stack MERN application that allows users to explore tours, view locations on interactive maps, manage accounts, and book tours securely.
The project is built with modern web technologies, follows best practices, and is fully deployed.

🚀 Live Demo :
https://natours-app-mocha.vercel.app

🛠 Tech Stack
Frontend

React (Vite)

Zustand – state management

Axios – API communication

Leaflet – interactive maps

CSS (BEM architecture)

Backend

Node.js

Express.js

MongoDB + Mongoose

JWT Authentication

Multer & Sharp – image uploads

Deployment

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas

✨ Core Features
🌍 Tours

View all available tours

Detailed tour pages with:

Description

Duration, difficulty, price

Locations displayed on interactive maps

Route visualization with markers and paths

🗺 Interactive Maps

Tour locations displayed using Leaflet

Custom map markers

Connected route paths

Smooth animations and zoom-to-bounds

🔐 Authentication & Authorization

User signup & login

JWT-based authentication

Secure cookies (httpOnly, sameSite, secure)

Persistent login (stay logged in on refresh)

Role-based access control

👤 User Account Management

View personal dashboard

Update name and email

Upload & update profile photo

Secure password change

Logout functionality

🔑 Password Recovery

Forgot password functionality

Email-based password reset link

Secure token-based password reset flow

🛡 Security Features

Password hashing with bcrypt

Rate limiting to prevent abuse

MongoDB sanitization (NoSQL injection protection)

XSS protection

Secure HTTP headers via Helmet

CORS configured for production deployment

📦 Project Structure
NATOURS/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── utils/
│   ├── db/
│   ├── index.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── index.html
│
└── README.md

🧪 Local Development
Backend
cd backend
npm install
npm run start:dev

Frontend
cd frontend
npm install
npm run dev
