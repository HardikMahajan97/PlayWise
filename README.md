# PlayWise Backend

## Overview

PlayWise is a badminton court booking system that allows users to browse available courts, make bookings, and manage their reservations.

This repository contains the backend of the application, developed using Node.js and Express.js.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js
- JWT Authentication

---

## Features

- User Registration and Login
- Secure Authentication
- Court Management
- Court Booking
- Booking History
- REST API
- Database Integration

---

## Project Structure

```
backend/
│── config/
│── controllers/
│── middleware/
│── models/
│── routes/
│── utils/
│── app.js
│── server.js
│── package.json
```

---

## Installation

1. Clone the repository

```bash
git clone <repository-url>
```

2. Navigate to backend folder

```bash
cd backend
```

3. Install dependencies

```bash
npm install
```

4. Create a `.env` file and add the required environment variables.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

5. Start the server

```bash
npm start
```

or

```bash
npm run dev
```

---

## API Modules

- Authentication
- Users
- Courts
- Bookings

---

## Future Enhancements

- Online Payment Integration
- Email Notifications
- Admin Dashboard
- Court Reviews and Ratings

---

## Authors

Developed as a college mini project.
