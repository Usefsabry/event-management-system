const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import middleware
const errorMiddleware = require('./middleware/error.middleware');

// Connect to database
connectDB();

const app = express();

// ==========================================
//CORS 
// ==========================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.options('*', cors());

// ==========================================
// 2. Middleware
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Event Management System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/registrations', require('./routes/registration.routes'));

// Additional routes can be added here

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;