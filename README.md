# Room Scheduler Application

A full-stack application for managing room bookings and reservations.

## Features

- User authentication and authorization
- Room management system
- Booking and scheduling functionality
- Admin dashboard for managing bookings and rooms

## Tech Stack

- Backend: Node.js with Express
- Frontend: HTML, CSS, JavaScript (Vanilla)
- Database: MongoDB

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- npm

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd Backend
   npm install
   ```

### Environment Variables

Create a `.env` file in the Backend directory with the following variables:
```
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### Running the Application

1. Start the backend server:
   ```bash
   cd Backend
   npm start
   ```

2. Open `login.html` in your web browser to access the application

3. Admin credentials:
   - Email: admin@example.com
   - Password: admin123

### Project Structure

```
room-scheduler/
├── Backend/                 # Express.js backend
├── Frontend-HTML/          # HTML/CSS/JavaScript frontend
│   ├── css/
│   ├── js/
│   └── index.html
├── admin-dashboard.html    # Admin dashboard
├── admin-dashboard.js      # Admin dashboard JavaScript
├── dashboard.html          # User dashboard
├── login.html             # Login page
└── styles.css            # Shared styles
```

## API Endpoints

- Authentication:
  - POST `/api/auth/register`
  - POST `/api/auth/login`
  - POST `/api/auth/logout`

- Rooms:
  - GET `/api/rooms`
  - POST `/api/rooms`
  - GET `/api/rooms/:id`
  - PUT `/api/rooms/:id`
  - DELETE `/api/rooms/:id`

- Bookings:
  - GET `/api/bookings`
  - POST `/api/bookings`
  - GET `/api/bookings/:id`
  - PUT `/api/bookings/:id`
  - DELETE `/api/bookings/:id`
