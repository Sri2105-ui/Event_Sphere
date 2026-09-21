# Event_Sphere

> A full-stack, enterprise-grade Event Management Platform with automated QR ticketing, real-time analytics, participant registration, digital certificate generation, and an administrative moderation dashboard.

---

## 🚀 Key Features

* **Event Management**: Create, edit, publish, and manage campus and corporate events with category filtering and ticket quotas.
* **Automated QR Ticketing**: Unique QR codes generated for every registration with live check-in scanning.
* **Role-Based Access Control (RBAC)**: Distinct permissions for `admin`, `organizer`, and `participant`.
* **Digital Certificates**: Automatically issued verification codes with public validation (`/api/certificates/verify/:code`).
* **Real-Time Updates**: Socket.IO powered live attendance counters and push notification broadcasts.
* **Modern UI/UX**: Responsive React application built with Tailwind CSS, Lucide icons, and Recharts analytics.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Axios, Socket.IO Client.
* **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT, Multer, Nodemailer.
* **Deployment**: Render Blueprint (`render.yaml`), Vercel compatible.

---

## 📦 Project Structure

```text
Event_Sphere/
├── backend/            # Express REST API & Socket server
│   ├── src/
│   │   ├── config/     # MongoDB & Socket configurations
│   │   ├── controllers/# Business logic
│   │   ├── middleware/ # Auth & validation
│   │   ├── models/     # Mongoose schemas
│   │   └── routes/     # Express route handlers
│   └── scripts/        # Database seed scripts
├── frontend/           # React + Vite client
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global Auth and Toast state
│   │   ├── pages/      # Admin, Organizer, Participant, and Public views
│   │   └── services/   # Axios API client
├── render.yaml         # Render Infrastructure as Code Blueprint
└── .gitignore          # Repository exclusions
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
* Node.js (v18+)
* MongoDB running locally (`mongodb://127.0.0.1:27017/eventsphere`) or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds demo users, events, and sample registrations
npm run dev      # Runs on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Runs on http://localhost:5173
```

---

## 🌐 Deploy to Render with Blueprint

This repository includes a `render.yaml` Blueprint for 1-click cloud deployment:

1. Push this repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Connect the `Sri2105-ui/Event_Sphere` repository.
5. Provide your `MONGODB_URI` environment variable when prompted.
6. Render will automatically provision both the **Backend Web Service** and **Frontend Static Site**.

---

## 👥 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@eventsphere.com` | `admin123` |
| **Organizer** | `organizer@eventsphere.com` | `organizer123` |
| **Participant** | `student@eventsphere.com` | `student123` |
