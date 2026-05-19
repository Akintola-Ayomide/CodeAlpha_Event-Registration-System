# Event Registration System API

A lightweight, robust REST API for managing users, events, and event registrations. Built with Node.js, Express, PostgreSQL, and Prisma ORM.

---

## Features

- **JWT Authentication**: Secure signup and login with hashed passwords via `bcryptjs`.
- **Public Events Access**: Anyone can view the list of events (with live capacity slot calculation) and event details.
- **Authenticated Registrations**: Registered users can sign up for events, see their registrations, and cancel their bookings.
- **Admin Control Panel**: Admins can create, update, and delete events, as well as fetch a full reporting view of all registrations.
- **Database Cascading**: Deleting events automatically cascades to remove related registrations.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma (v7)
- **Database**: PostgreSQL
- **Security**: jsonwebtoken, bcryptjs

---

## Project Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- Running [PostgreSQL](https://www.postgresql.org/) database.

### 2. Configuration (`.env`)
Create a `.env` file in the root directory and configure the environment variables:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/event_registration_db?schema=public"
JWT_SECRET="your_jwt_secret_key"
```

### 3. Installation
Install the project dependencies:
```bash
npm install
```

### 4. Database Migrations
Run the Prisma migrations to create the database schema:
```bash
npx prisma migrate dev --name init
```

### 5. Seeding Database (Optional)
To pre-populate the database with default test users (both `USER` and `ADMIN` roles) and mock events:
```bash
npx prisma db seed
```
This seeds the following credentials:
- **Admin**: `admin@example.com` | Password: `admin123`
- **Normal User**: `user@example.com` | Password: `user123`

---

## Running the Application

- **Production Mode**:
  ```bash
  npm start
  ```
- **Development Mode** (with Nodemon hot reloading):
  ```bash
  npm run dev
  ```

The server will start listening on the port configured in `.env` (default is `5000`).

---

## API Endpoints

All protected endpoints require passing a JWT token in the request header:
`Authorization: Bearer <your_jwt_token>`

### 1. Authentication Endpoints

#### `POST /auth/signup`
Creates a new user account.
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "securepassword",
    "role": "USER" // Optional, default is "USER". Can be "ADMIN"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email": "newuser@example.com",
      "role": "USER",
      "createdAt": "2026-05-19T09:00:00.000Z"
    }
  }
  ```

#### `POST /auth/login`
Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "securepassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email": "newuser@example.com",
      "role": "USER",
      "createdAt": "2026-05-19T09:00:00.000Z"
    }
  }
  ```

---

### 2. Public Event Endpoints (No Auth Required)

#### `GET /events`
Retrieves all events. It dynamically calculates the remaining capacity slots.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "title": "Tech Conference 2026",
      "description": "The premier conference for developers and designers.",
      "date": "2026-09-15T09:00:00.000Z",
      "location": "San Francisco, CA",
      "capacity": 100,
      "remainingSlots": 99,
      "createdAt": "2026-05-19T09:00:00.000Z"
    }
  ]
  ```

#### `GET /events/:id`
Retrieves detailed information of a single event by ID.
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "title": "Tech Conference 2026",
    "description": "The premier conference for developers and designers.",
    "date": "2026-09-15T09:00:00.000Z",
    "location": "San Francisco, CA",
    "capacity": 100,
    "remainingSlots": 99,
    "createdAt": "2026-05-19T09:00:00.000Z"
  }
  ```

---

### 3. Registration Endpoints (Authenticated)

#### `POST /registrations`
Registers the logged-in user for an event. Checks capacity limits and prevents duplicate registrations.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "eventId": 1
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Successfully registered for the event",
    "registration": {
      "id": 1,
      "userId": 2,
      "eventId": 1,
      "registeredAt": "2026-05-19T09:30:00.000Z",
      "status": "CONFIRMED",
      "event": {
        "id": 1,
        "title": "Tech Conference 2026",
        "date": "2026-09-15T09:00:00.000Z",
        "location": "San Francisco, CA"
      }
    }
  }
  ```

#### `GET /registrations/me`
Lists all registrations for the logged-in user.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "userId": 2,
      "eventId": 1,
      "registeredAt": "2026-05-19T09:30:00.000Z",
      "status": "CONFIRMED",
      "event": {
        "id": 1,
        "title": "Tech Conference 2026",
        "date": "2026-09-15T09:00:00.000Z",
        "location": "San Francisco, CA"
      }
    }
  ]
  ```

#### `DELETE /registrations/:id`
Cancels an event registration by changing its status to `"CANCELLED"`. Users can only cancel their own registrations.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "message": "Registration successfully cancelled",
    "registration": {
      "id": 1,
      "userId": 2,
      "eventId": 1,
      "status": "CANCELLED",
      "event": {
        "id": 1,
        "title": "Tech Conference 2026"
      }
    }
  }
  ```

---

### 4. Admin Endpoints (Admin JWT Token Required)

#### `POST /admin/events`
Creates a new event.
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Body**:
  ```json
  {
    "title": "React Deep Dive Workshop",
    "description": "Advanced training on React concurrent mode.",
    "date": "2026-11-05T13:00:00.000Z",
    "location": "Online / Zoom",
    "capacity": 50
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Event created successfully",
    "event": {
      "id": 3,
      "title": "React Deep Dive Workshop",
      "description": "Advanced training on React concurrent mode.",
      "date": "2026-11-05T13:00:00.000Z",
      "location": "Online / Zoom",
      "capacity": 50,
      "createdAt": "2026-05-19T09:34:00.000Z"
    }
  }
  ```

#### `PUT /admin/events/:id`
Updates an existing event's details. Supports partial updates.
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Body**:
  ```json
  {
    "capacity": 60,
    "location": "New York, NY"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Event updated successfully",
    "event": {
      "id": 3,
      "title": "React Deep Dive Workshop",
      "description": "Advanced training on React concurrent mode.",
      "date": "2026-11-05T13:00:00.000Z",
      "location": "New York, NY",
      "capacity": 60,
      "createdAt": "2026-05-19T09:34:00.000Z"
    }
  }
  ```

#### `DELETE /admin/events/:id`
Deletes an event and automatically cascades deletions for its registrations.
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response (200 OK)**:
  ```json
  {
    "message": "Event and all its associated registrations deleted successfully"
  }
  ```

#### `GET /admin/registrations`
Retrieves a list of all registrations made across the entire system.
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "userId": 2,
      "eventId": 1,
      "registeredAt": "2026-05-19T09:30:00.000Z",
      "status": "CONFIRMED",
      "user": {
        "id": 2,
        "email": "user@example.com",
        "role": "USER",
        "createdAt": "2026-05-19T09:00:00.000Z"
      },
      "event": {
        "id": 1,
        "title": "Tech Conference 2026",
        "date": "2026-09-15T09:00:00.000Z",
        "location": "San Francisco, CA"
      }
    }
  ]
  ```
