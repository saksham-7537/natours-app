Here is the updated `README.md` with a dedicated, professional section for your application screenshots. I have set it up using a grid-style markdown table, which looks very clean and impressive to recruiters when filled with images.

---

# Natours - Full-Stack Tour Booking Platform

## Overview

Natours is a robust, full-stack web application designed for browsing and booking modern travel experiences. Built with the MERN stack, the application emphasizes secure user authentication, responsive design, and seamless interactive map integrations. The architecture follows modern development practices, prioritizing performance, scalability, and security to deliver a professional, production-ready user experience.

## Live Application

**View Live Demo:** [https://natours-app-mocha.vercel.app](https://www.google.com/search?q=https://natours-app-mocha.vercel.app)

## Application Previews

> **Note to Developer:** Replace `insert-image-path-here.png` with the actual paths or URLs to your screenshots.

| Home Page & Tour Catalog | Interactive Leaflet Map |
| --- | --- |
|  |  |

| Tour Details & Booking | User Dashboard & Profile |
| --- | --- |
|  |  |

## Technology Stack

### Frontend

* **Framework:** React (Vite)
* **State Management:** Zustand
* **Data Fetching:** Axios
* **Mapping:** Leaflet.js
* **Styling:** CSS (BEM Architecture)

### Backend

* **Runtime / Framework:** Node.js, Express.js
* **Database:** MongoDB & Mongoose
* **Authentication:** JSON Web Tokens (JWT) with HTTP-only cookies
* **Asset Management:** Multer & Sharp (Image processing)

### Infrastructure

* **Frontend Hosting:** Vercel
* **Backend Hosting:** Render
* **Database:** MongoDB Atlas

## Core Features

* **Dynamic Tour Catalog:** Search and explore tours with detailed itineraries, pricing, and difficulty ratings.
* **Interactive Geolocation:** Utilizes Leaflet to render interactive maps with custom markers and responsive tour paths.
* **Secure Authentication:** Implementation of a complete user lifecycle, including JWT-based login, protected routes, and persistent session management.
* **Profile Management:** User dashboard supporting account updates, secure password changes, and profile photo uploads.
* **Password Recovery:** Integrated flow for secure token-based password resets via email.

## Security Engineering

The backend is designed with a "security-first" approach to protect against common web vulnerabilities:

* **Authentication Security:** Passwords are hashed using bcrypt; JWTs are stored in secure, HTTP-only cookies.
* **Rate Limiting:** Protects against brute-force attacks and service abuse.
* **Injection Defense:** Implementation of data sanitization to prevent NoSQL injection and XSS.
* **Hardened Headers:** Integration of Helmet.js to manage security-focused HTTP headers.
* **CORS:** Strictly configured Cross-Origin Resource Sharing for production environments.

## Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/saksham-7537/natours-app.git
cd natours-app

```

### 2. Backend Setup

```bash
cd backend
npm install

```

*Create a `.env` file in the backend root and add your environment variables (e.g., `MONGO_URI`, `JWT_SECRET`, `PORT`).*

```bash
npm run start

```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev

```
