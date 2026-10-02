# API Testing Guide

## Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```
Server runs on: http://localhost:5000

### 2. Start the Frontend Server
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5174

### 3. Import Postman Collection
Import `Postman_Collection_Simple.json` into Postman for complete API testing.

## Manual API Testing

### Step 1: Register a New User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### Step 2: Login User
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:** Copy the `token` from the response for authenticated requests.

### Step 3: Create a Category
```bash
POST http://localhost:5000/api/categories
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "name": "Technology",
  "description": "Tech workshops and conferences"
}
```

**Response:** Copy the category `_id` for creating events.

### Step 4: Create an Event
```bash
POST http://localhost:5000/api/events
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "title": "React Workshop for Beginners",
  "description": "Learn React from scratch with hands-on projects",
  "category": "CATEGORY_ID_FROM_STEP_3",
  "date": "2026-12-15",
  "time": "10:00 AM",
  "location": "Online",
  "capacity": 50,
  "price": 100
}
```

### Step 5: Get All Events
```bash
GET http://localhost:5000/api/events
```

### Step 6: Register for an Event
```bash
POST http://localhost:5000/api/registrations
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "eventId": "EVENT_ID_FROM_STEP_4"
}
```

### Step 7: Get User's Registrations
```bash
GET http://localhost:5000/api/registrations/my
Authorization: Bearer YOUR_TOKEN_HERE
```

## Testing Different Scenarios

### Search and Filter Events
```bash
# Search by title
GET http://localhost:5000/api/events?search=react

# Filter by category
GET http://localhost:5000/api/events?category=Technology

# Filter by date range
GET http://localhost:5000/api/events?startDate=2026-12-01&endDate=2026-12-31

# Combine filters with pagination
GET http://localhost:5000/api/events?search=workshop&category=Technology&page=1&limit=5
```

### Test Error Cases
```bash
# Try registering for the same event twice (should fail)
POST http://localhost:5000/api/registrations
Authorization: Bearer YOUR_TOKEN_HERE
{
  "eventId": "SAME_EVENT_ID_AS_BEFORE"
}

# Try accessing protected route without token (should fail)
GET http://localhost:5000/api/auth/profile

# Try registering for non-existent event (should fail)
POST http://localhost:5000/api/registrations
Authorization: Bearer YOUR_TOKEN_HERE
{
  "eventId": "507f1f77bcf86cd799439011"
}
```

## Expected Responses

### Successful Registration Response:
```json
{
  "success": true,
  "message": "Successfully registered for event",
  "data": {
    "registration": {
      "_id": "...",
      "user": "...",
      "event": "...",
      "registeredAt": "2026-10-01T23:45:00.000Z"
    }
  }
}
```

### Events List Response:
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "...",
        "title": "React Workshop for Beginners",
        "description": "Learn React from scratch...",
        "category": {
          "_id": "...",
          "name": "Technology"
        },
        "date": "2026-12-15T00:00:00.000Z",
        "time": "10:00 AM",
        "location": "Online",
        "capacity": 50,
        "registeredCount": 1,
        "price": 100,
        "organizer": {
          "_id": "...",
          "name": "Test User"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalEvents": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

## Frontend Testing

### 1. Open Frontend
Visit: http://localhost:5174

### 2. Check Features
- ✅ Landing page loads with proper styling
- ✅ Navigation bar displays correctly
- ✅ Hero section shows rainbow gradient text effect
- ✅ Event cards display with proper styling
- ✅ Responsive design on mobile/desktop

### 3. Browser Console
Check for any JavaScript errors in the browser console (F12).

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** Check your MongoDB connection string in `.env`

### Issue: "JWT token expired"
**Solution:** Login again to get a fresh token

### Issue: "Port already in use"
**Solution:** Change ports in the respective package.json files

### Issue: Tailwind styles not loading
**Solution:** Restart the frontend dev server

### Issue: CORS errors
**Solution:** Backend includes CORS middleware, but ensure frontend is on http://localhost:5174

## Database Verification

### Check MongoDB Atlas
1. Login to MongoDB Atlas
2. Navigate to Collections
3. Verify data is being saved:
   - `users` collection should have your test user
   - `categories` collection should have your test category
   - `events` collection should have your test event
   - `registrations` collection should have your registration

## Performance Testing

### Test Event Capacity Limits
1. Create an event with capacity=2
2. Register 2 different users
3. Try to register a 3rd user (should fail with "Event is full")

### Test Auto-Counter Updates
1. Create an event (registeredCount should be 0)
2. Register for the event
3. Check event again (registeredCount should be 1)
4. Cancel registration
5. Check event again (registeredCount should be 0)

## Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **404**: Not found
- **409**: Conflict (duplicate registration)
- **500**: Server error

## Next Steps

After successful testing:
1. ✅ Backend API is fully functional
2. ✅ Frontend displays correctly
3. 🔄 Add more pages (login, registration, event details)
4. 🔄 Connect frontend to backend API
5. 🔄 Add user authentication flow
6. 🔄 Add event management features