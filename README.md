    # Event Management System

A full-stack event management application built with Node.js, Express, MongoDB, React, and TypeScript.

## Features

### Backend (API)
- **User Authentication**: Registration, login, and JWT-based authentication
- **Event Management**: Create, read, update, delete events with advanced filtering
- **Category Management**: Organize events by categories
- **Registration System**: Users can register/cancel event registrations with capacity management
- **Auto-updating Counters**: Registration counts update automatically
- **Advanced Search & Filtering**: Search events by title, category, date, location
- **Pagination**: Efficient pagination for large datasets

### Frontend
- **Modern UI**: Built with React + TypeScript and Tailwind CSS
- **Portrait Design System**: Beautiful, consistent design following Portrait guidelines
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Landing Page**: Showcases trending events and statistics
- **Authentication Pages**: Login and registration forms
- **Event Discovery**: Browse and search events
- **User Dashboard**: Manage profile and registered events

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Environment**: dotenv

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation

## Project Structure

```
event-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth & validation middleware
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper utilities
│   │   ├── validations/     # Input validation schemas
│   │   ├── config/          # Database configuration
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/             # Utilities
│   │   ├── App.tsx          # Main app component
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── tailwind.config.js   # Tailwind configuration
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy `.env.example` to `.env` and configure:
   ```
   MONGODB_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-jwt-secret-key
   PORT=5000
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```
   
   Server will run on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will run on http://localhost:5174

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (protected)
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category (protected)
- `DELETE /api/categories/:id` - Delete category (protected)

### Events
- `GET /api/events` - Get events with filtering & pagination
- `POST /api/events` - Create event (protected)
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event (protected)
- `DELETE /api/events/:id` - Delete event (protected)

### Registrations
- `POST /api/registrations` - Register for event (protected)
- `GET /api/registrations/my` - Get user's registrations (protected)
- `DELETE /api/registrations/:id` - Cancel registration (protected)

## Testing

### API Testing with Postman
Import the provided Postman collection: `Postman_Collection_Simple.json`

The collection includes:
- Environment setup
- Authentication workflow
- Complete CRUD operations for all endpoints
- Example requests with proper headers and body data

### Frontend Testing
```bash
cd frontend
npm run build  # Test production build
npm run preview  # Preview production build
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
JWT_SECRET=your-super-secure-jwt-secret-key-here
PORT=5000
NODE_ENV=development
```

### Frontend
No environment variables required for basic setup. API calls are configured to use localhost:5000.

## Database Schema

### Users
- `name`: String (required)
- `email`: String (unique, required)
- `password`: String (hashed, required)
- `role`: String (default: 'user')

### Categories
- `name`: String (unique, required)
- `description`: String (optional)

### Events
- `title`: String (required)
- `description`: String (required)
- `category`: ObjectId (ref: Category)
- `date`: Date (required)
- `time`: String (required)
- `location`: String (required)
- `capacity`: Number (required)
- `registeredCount`: Number (default: 0)
- `price`: Number (default: 0)
- `organizer`: ObjectId (ref: User)

### Registrations
- `user`: ObjectId (ref: User)
- `event`: ObjectId (ref: Event)
- `registeredAt`: Date (default: now)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, create an issue in the repository or contact the development team.