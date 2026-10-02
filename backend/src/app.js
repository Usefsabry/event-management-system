const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/error.middleware');

connectDB();

const app = express();

// ==========================================
// إعدادات CORS المحدثة
// ==========================================
// 1. استخدام app.use(cors()) مع الخيارات يكفي لمعالجة جميع الطلبات والـ Preflight تلقائياً
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// 2. إذا أردت استثناء خيار Preflight صريحاً، استخدم السلسلة النصية '/(.*)' بدلاً من '*'
app.options('/(.*)', cors());

// ==========================================
// باقي الـ Middlewares والـ Routes
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Event Management System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/registrations', require('./routes/registration.routes'));

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;