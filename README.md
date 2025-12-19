# 🌍 Natours – Full Stack Tour Booking Application

Natours is a **full-stack MERN application** that allows users to explore tours, view locations on interactive maps, manage accounts, and securely authenticate.  
The project follows **modern web development practices** and is fully deployed.

---

## 🚀 Live Demo
- https://natours-app-mocha.vercel.app  


---

## 🛠 Tech Stack

### Frontend
- **React (Vite)**
- **Zustand** – state management
- **Axios** – API communication
- **Leaflet** – interactive maps
- **CSS (BEM architecture)**

### Backend
- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Multer & Sharp** – image uploads
- **Helmet, Rate Limiting, Data Sanitization**

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

---

## ✨ Core Features

### 🌍 Tours
- Browse all available tours
- Detailed tour pages with:
  - Duration, difficulty, price
  - Description & highlights
  - Interactive map with tour route

### 🗺 Interactive Maps
- Tour locations rendered using **Leaflet**
- Custom markers & route paths
- Smooth zoom & pan animations
- Automatically fits bounds to tour route

---

## 🔐 Authentication & Authorization

- User **signup & login**
- **JWT-based authentication**
- Secure cookies (`httpOnly`, `sameSite`, `secure`)
- Persistent login across refresh
- Protected routes

---

## 👤 User Account Management

- User dashboard
- Update name & email
- Upload & update profile photo
- Change password securely
- Logout functionality

---

## 🔑 Password Recovery

- Forgot password flow
- Email-based password reset link
- Secure token-based password reset

---

## 🛡 Security Features

- Password hashing with **bcrypt**
- **Rate limiting** against brute force attacks
- **NoSQL injection protection**
- **XSS protection**
- Secure HTTP headers via **Helmet**
- Proper CORS configuration for production
