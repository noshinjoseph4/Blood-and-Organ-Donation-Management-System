# VitalConnect: Blood and Organ Donation Management System

VitalConnect is a modern, full-stack application designed to stream-line and optimize blood and organ donations. It connects patients in need directly with eligible donors and verified hospitals, leveraging real-time proximity matching and integrated hospital fulfillment workflows.

## Features

- **Role-Based Access Control:** Distinct dashboards and workflows for Patients, Donors, Hospitals, and Administrators.
- **Smart Proximity Matching:** Automatically links patients with the nearest eligible donors based on blood group and geolocation.
- **Real-time Patient-Donor Workflow:**
  - Patients can broadcast urgent blood/organ requests.
  - Donors receive notifications for matching requests and can click "Accept/Willing".
  - Hospitals validate and complete the donation process.
- **Live Inventory Management:** Hospitals can monitor and automatically update their blood inventories upon successful donations.
- **Gamification & Leaderboards:** Donors earn "Hero Points" and streaks for successful donations, tracked on a global leaderboard.
- **Secure Architecture:** Django Rest Framework backend with token authentication and encrypted medical records.
- **Modern UI/UX:** Built with React, Tailwind CSS, and Framer Motion for a responsive and intuitive experience.

## Tech Stack

### Backend
- **Framework:** Django & Django REST Framework (DRF)
- **Database:** SQLite (Development) / PostgreSQL (Production)
- **Authentication:** Token-based Auth

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Icons:** Lucide React

---

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+ & npm
- Git

### 1. Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd BLORMS_2026/backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```bash
   python manage.py migrate
   ```
5. Create a superuser (Admin):
   ```bash
   python manage.py createsuperuser
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```
   *The backend will be running at `http://127.0.0.1:8000/`*

### 2. Frontend Setup (React/Vite)

1. Open a new terminal instance and navigate to the frontend directory:
   ```bash
   cd BLORMS_2026/frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will generally be running at `http://localhost:5173/`*

---

## Project Structure

```text
VitalConnect/
├── BLORMS_2026/
│   ├── backend/             # Django Backend
│   │   ├── api/             # Main Application Logic (Views, Models, Serializers)
│   │   ├── blorms_project/  # Django Core Settings
│   │   └── manage.py        # Django CLI
│   └── frontend/            # React Frontend
│       ├── src/
│       │   ├── api/         # Axios Interceptors
│       │   ├── components/  # Reusable UI Components
│       │   ├── context/     # React Context (Auth State)
│       │   └── pages/       # Route Views (Dashboard, Maps, etc.)
│       ├── index.html
│       └── vite.config.js
└── .gitignore
```
