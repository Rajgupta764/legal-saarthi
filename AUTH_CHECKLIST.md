# Quick Start Checklist

Complete this checklist to verify your authentication system is properly set up:

## Backend Setup
- [ ] MongoDB installed and running
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created with MongoDB URI and JWT secret
- [ ] JWT_SECRET changed from default value
- [ ] Backend server running on port 5000
- [ ] Health check endpoint responds: `GET http://localhost:5000/api/health`

## Frontend Setup
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `.env` file created with API_URL (if custom)
- [ ] Frontend dev server running on port 5173
- [ ] Home page loads without errors
- [ ] "Start" button visible on home page

## Testing the Flow
- [ ] Navigate to `http://localhost:5173/`
- [ ] Click "Start" button
- [ ] Should redirect to `/auth` page
- [ ] See login and signup tabs
- [ ] Click "रजिस्टर" (Signup) tab
- [ ] Fill in test credentials:
  - Name: Test User
  - Email: test@example.com
  - Phone: 9876543210
  - Password: Test123456
- [ ] Click "रजिस्टर करें" (Register) button
- [ ] Should redirect to `/dashboard` after successful signup
- [ ] User info should be displayed in navbar/profile

## Auth Token Verification
- [ ] Open browser DevTools (F12)
- [ ] Open Application/Storage tab
- [ ] Check localStorage for `auth_token` and `user_data`
- [ ] Token should be a long JWT string starting with "eyJ"

## Login Test
- [ ] Logout from dashboard
- [ ] Should redirect to home page
- [ ] Click "Start" button again
- [ ] Click "लॉगिन" (Login) tab
- [ ] Enter same email and password from signup
- [ ] Should successfully login and redirect to dashboard

## Security Checks
- [ ] Try accessing `/dashboard` without token
- [ ] Should redirect to `/auth` page
- [ ] Try with invalid token
- [ ] Should redirect to `/auth` page
- [ ] MongoDB passwords are not visible in code
- [ ] JWT_SECRET is changed from default

## Common Issues to Check
- [ ] Backend console shows no errors
- [ ] Frontend console shows no 404 errors
- [ ] Network tab shows successful API calls (200/201 status)
- [ ] CORS errors are not present
- [ ] MongoDB connection is successful

## Performance Check
- [ ] Signup takes less than 2 seconds
- [ ] Login takes less than 1 second
- [ ] Page loads are smooth without lag
- [ ] No console warnings or errors

## Data Verification (MongoDB)
```bash
# Connect to MongoDB
mongosh

# Use database
use legal_saathi_db

# Check users collection
db.users.find()

# Should show registered user with hashed password
```

## Final Testing Workflow
1. **Clear all data**: `db.users.deleteMany({})`
2. **Create new user via signup**
3. **Verify user exists in MongoDB**
4. **Logout and clear localStorage**
5. **Login with same credentials**
6. **Verify token is stored and valid**
7. **Test protected route access**
8. **Test token expiry (wait 24 hours or modify JWT_EXPIRY_HOURS)**

## Deployment Checklist
- [ ] Change JWT_SECRET to strong random value
- [ ] Update VITE_API_URL to production backend URL
- [ ] Enable HTTPS for all API calls
- [ ] Set FLASK_ENV to 'production'
- [ ] Configure MongoDB Atlas for cloud database
- [ ] Set up error logging and monitoring
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up automatic backups

## Success Indicators
✅ All items in checklist are completed
✅ No errors in console during auth flow
✅ User data persists across page refreshes
✅ Protected routes work correctly
✅ Logout clears all auth data
✅ MongoDB stores user data securely

---

If any checklist item fails, refer to the `AUTHENTICATION_SETUP.md` file for detailed troubleshooting steps.
