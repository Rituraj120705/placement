# Placement Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application designed to automate and streamline the college placement process.

## Prerequisites
- **Node.js**: Make sure Node.js is installed on your system.
- **MongoDB**: This project requires MongoDB to be running locally on the default port `27017`.
  - Alternatively, you can change the `MONGO_URI` in `backend/.env` to connect to a MongoDB Atlas cluster.

## How to Run the Project

You will need to run the backend and frontend servers simultaneously in two separate terminal windows.

### 1. Start the Backend Server
Open your first terminal window, navigate to the `backend` folder, and start the Node server:

```bash
cd backend
node server.js
```
*The backend server will run on `http://localhost:5000`.*

### 2. Start the Frontend Application
Open a second terminal window, navigate to the `frontend` folder, and start the React development server:

```bash
cd frontend
npm run dev
```
*The frontend will run on `http://localhost:5173` (or depending on port availability, `http://localhost:5174`). Simply click the link that appears in the terminal.*

## Default Environment Variables
- **Backend Port:** `5000`
- **MongoDB URI:** `mongodb://localhost:27017/placement_system`
- **JWT Secret:** `super_secret_jwt_key_for_placement_app`
