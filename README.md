# ExpertDock — Real-Time Expert Session Booking System

A full-stack booking platform built with **React + Node.js + Express + MongoDB + Socket.io**.

---

## 🏗 Project Structure

```
expert-booking/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Business logic (expertController, bookingController)
│   ├── middleware/       # Input validation (express-validator)
│   ├── models/          # Mongoose schemas (Expert, Booking)
│   ├── routes/          # API routes (expertRoutes, bookingRoutes)
│   ├── seed.js          # Database seeder with 10 sample experts
│   ├── server.js        # Express + Socket.io server entry
│   └── .env.example
│
└── frontend/
    ├── public/
    └── src/
        ├── context/     # SocketContext (Socket.io provider)
        ├── pages/       # ExpertList, ExpertDetail, BookingForm, MyBookings
        ├── utils/       # Axios API client
        ├── App.jsx      # Router + Layout
        └── App.css      # Full design system
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGODB_URI if needed
npm run seed      # Seed 10 expert records
npm run dev       # Start on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm start         # Start on http://localhost:3000
```

---

## 🛠 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experts` | List experts (pagination + search + filter) |
| GET | `/api/experts/:id` | Expert detail with grouped available slots |
| POST | `/api/bookings` | Create booking (validated + race-condition safe) |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| GET | `/api/bookings?email=` | Get bookings by email |
| GET | `/api/health` | Health check |

### Query Parameters — `GET /api/experts`
- `page` (default: 1)
- `limit` (default: 8)
- `search` — name or bio full-text search
- `category` — Technology, Finance, Health, Legal, Marketing, Design, Business, Education

---

## 🔒 Race Condition Prevention

Double-booking is prevented by:

1. **Atomic MongoDB `findOneAndUpdate`** — only marks slot as booked if `isBooked: false`:
   ```js
   Expert.findOneAndUpdate(
     { _id, 'timeSlots.date': date, 'timeSlots.time': timeSlot, 'timeSlots.isBooked': false },
     { $set: { 'timeSlots.$.isBooked': true } }
   )
   ```
2. **Unique compound index** on `Booking` model `{ expert, date, timeSlot }` as a safety net
3. **MongoDB transactions** wrap both the slot update and booking creation

---

## 🔴 Real-Time Slot Updates (Socket.io)

- When a booking is created, the server emits `slot-booked` to all clients in that expert's room
- When a booking is cancelled, the server emits `slot-freed`
- `ExpertDetail` page joins `expert-{id}` room on mount and updates slot state immediately

---

## 📋 Features

| Feature | Details |
|---------|---------|
| Expert Listing | Cards with name, category, experience, rating, hourly rate |
| Search | Name + bio search with 400ms debounce |
| Filter | Category filter pills |
| Pagination | Server-side, 8 per page |
| Expert Detail | Bio, skills, availability grouped by date |
| Real-time slots | Socket.io live updates across all open tabs |
| Booking Form | Validation for name, email, phone, notes |
| Success State | Confirmation screen after booking |
| My Bookings | Lookup by email, grouped by status |
| Status Display | Pending / Confirmed / Completed / Cancelled |

---

## 🌱 Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expert_booking
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Deployment

### Backend (Railway / Render / Fly.io)
```bash
# Set environment variables in dashboard
# Start command: node server.js
```

### Frontend (Vercel / Netlify)
```bash
# Build command: npm run build
# Output dir: build
# Set REACT_APP_API_URL and REACT_APP_SOCKET_URL to deployed backend URL
```

> **Note**: Socket.io on Vercel requires the backend to be deployed separately (Vercel is serverless and doesn't support persistent WebSocket connections).
