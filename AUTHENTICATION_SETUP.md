# Authentication System Setup Guide

This guide explains how to set up and run the complete authentication system with MongoDB for Legal Saathi.

## Architecture Overview

The system consists of:
- **Frontend**: React/Vite with JWT-based authentication
- **Backend**: Python Flask with MongoDB database
- **Database**: MongoDB for user storage
- **Authentication**: JWT tokens with bcrypt password hashing

## Prerequisites

### System Requirements
- Node.js 16+ (for frontend)
- Python 3.8+ (for backend)
- MongoDB 4.0+ (local or cloud)

### Backend Setup

1. **Install Python Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure MongoDB Connection**
   
   Create a `.env` file in the backend directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your MongoDB connection details:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017
   DATABASE_NAME=legal_saathi_db
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-key-change-in-production-12345
   JWT_EXPIRY_HOURS=24
   
   # Flask Configuration
   FLASK_ENV=development
   FLASK_DEBUG=True
   ```

3. **Start MongoDB**
   
   **On Windows:**
   ```bash
   # If installed via MongoDB Community
   net start MongoDB
   ```
   
   **On macOS:**
   ```bash
   brew services start mongodb-community
   ```
   
   **On Linux:**
   ```bash
   sudo systemctl start mongod
   ```
   
   **Using Docker:**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Run Backend Server**
   ```bash
   cd backend
   python app.py
   ```
   
   The backend should start on `http://localhost:5000`

### Frontend Setup

1. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL** (if different from default)
   
   Create `.env` file in frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```
   
   The frontend should start on `http://localhost:5173`

## API Endpoints

### Authentication Endpoints

#### 1. Register (Signup)
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "9876543210",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "9876543210",
      "created_at": "2026-02-28T...",
      "is_active": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 2. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 3. Verify Token
```
POST /api/auth/verify-token
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "email": "user@example.com",
    "name": "John Doe",
    "iat": 1234567890,
    "exp": 1234654290
  }
}
```

#### 4. Get User Info
```
GET /api/auth/user
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "9876543210",
    "created_at": "2026-02-28T...",
    "is_active": true
  }
}
```

## Frontend Flow

1. **Home Page** → User clicks "Start" button
2. **Auth Page** → Redirects to `/auth`
3. **Toggle Between Login/Signup** → User can switch modes
4. **Login/Signup** → Makes API call to backend
5. **Token Storage** → JWT token stored in localStorage
6. **Dashboard Access** → ProtectedRoute checks authentication
7. **Logout** → Clears token and redirects to home

## Database Schema

### Users Collection
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "9876543210",
  "password_hash": "bcrypt_hash_here",
  "created_at": ISODate,
  "updated_at": ISODate,
  "is_active": true
}
```

## Security Features

1. **Password Hashing** → Passwords are hashed using bcrypt
2. **JWT Tokens** → Secure token-based authentication
3. **Token Expiry** → Tokens expire after 24 hours (configurable)
4. **CORS Protection** → Only allowed origins can access API
5. **Authorization Headers** → All protected routes require Bearer token

## Troubleshooting

### MongoDB Connection Error
```
✗ MongoDB connection failed: [connection error]
```
**Solution:**
- Check if MongoDB is running: `mongosh` or `mongo`
- Verify MONGODB_URI in .env file
- Ensure MongoDB service is started

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:**
- Check CORS origins in `app/__init__.py`
- Add your frontend URL to CORS allowed origins
- Restart backend server

### Token Expired
```
Token expired
```
**Solution:**
- Clear localStorage and login again
- Increase JWT_EXPIRY_HOURS in .env if needed
- Implement token refresh endpoint for production

### MongoDB Atlas Cloud Database
If using MongoDB Atlas instead of local MongoDB:
1. Create cluster on https://www.mongodb.com/cloud/atlas
2. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/dbname`
3. Update MONGODB_URI in .env
4. Whitelist your IP address

## Production Deployment

1. **Change JWT_SECRET** to a strong random string
2. **Enable HTTPS** for all API calls
3. **Set FLASK_ENV** to 'production'
4. **Implement Token Refresh** mechanism
5. **Add Rate Limiting** to prevent brute force attacks
6. **Enable MongoDB Authentication** and create user accounts
7. **Use Environment Variables** for all sensitive data

## Testing the Auth Flow

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","phone":"9876543210","password":"Pass123456"}'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123456"}'
```

### Test Token Verification
```bash
curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

1. Implement password reset functionality
2. Add email verification
3. Implement token refresh mechanism
4. Add two-factor authentication
5. Create admin dashboard for user management
6. Implement logging and monitoring
