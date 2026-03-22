# 🍱 Smart Canteen Ordering System (Pro)

A modern, full-stack food ordering application with **AI-driven recommendations**, **Live Order Tracking**, and a premium **Dark Theme** interface. Built with React, Node.js, and MongoDB.

## 🌟 Advanced Features

-   **🔐 Secure Authentication**: Integrated Login and Sign-Up system with persistent sessions.
-   **📡 Live Order Tracking**: Real-time visual progress bar for orders (Placed → Preparing → Out for Delivery → Delivered).
-   **🤖 AI Smart Picks**: Personalized food recommendations based on user order history and crowd favorites.
-   **⭐ Integrated Ratings & Reviews**: Community feedback system with star ratings and detailed reviews on every dish.
-   **🔥 Trending Now**: Dynamic sections highlighting the most popular items in the canteen.
-   **📱 Premium Responsive UI**: A sleek, dark-mode interface optimized for both desktop and mobile.

## 🛠️ Technology Stack

-   **Frontend**: React.js, Vite, Bootstrap 5, FontAwesome.
-   **Backend**: Node.js, Express.
-   **Database**: MongoDB (with Mongoose ODM).
-   **Dev Tools**: Nodemon (auto-restarts), Concurrent startup.

## 🚀 Quick Start

You can now start the entire project (Frontend + Backend + Database) with a single command from the project root.

### 1. Prerequisites
-   [Node.js](https://nodejs.org/) (v16 or higher)
-   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.

### 2. Setup (First time only)
Install all dependencies for both frontend and backend automatically:
```bash
npm run setup
```

### 3. Run Development Server
Start the MongoDB service, Backend API, and Frontend Dev server simultaneously:
```bash
npm run dev
```
-   **Frontend**: [http://localhost:5173](http://localhost:5173)
-   **Backend API**: [http://localhost:5000](http://localhost:5000)

## 📁 Project Structure

```text
├── smart-canteen-react/   # Main Frontend (Vite + React)
│   ├── src/               # UI Components & Logic
│   └── server/            # Node.js API & Models
├── database/              # Original SQL schema & docs
├── docs/                  # Project documentation & User Guide
├── package.json           # Root orchestrator for the project
└── .gitignore             # Optimized for Node.js & local DB
```

## 📝 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/login` | User authentication |
| `POST` | `/api/customers` | User registration |
| `GET` | `/api/menu` | Fetch all menu items |
| `POST` | `/api/orders` | Place a new order |
| `GET` | `/api/orders` | Track order status |
| `POST` | `/api/menu/:id/reviews` | Leave a review & rating |
| `GET` | `/api/recommendations` | Get AI-powered suggestions |

---

## 👨‍💻 Development Guide

-   **Adding Features**: Frontend logic is in `src/App.jsx`. Backend routes are in `server/server.js`.
-   **Seeding Data**: The database auto-seeds with popular Indian dishes on the first run.
-   **Simulated Tracking**: For the demo, order status updates automatically every 10 seconds.

*This project is an enhanced version of the Smart Canteen DBMS project, focused on modern full-stack development and AI integration.*
