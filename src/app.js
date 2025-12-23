// src/app.js (UPDATED)
'use strict';

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Import DB connection and routes
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolios');
const transactionRoutes = require('./routes/transactions');
const marketRoutes = require('./routes/market');
const alertRoutes = require('./routes/alerts');
const authDemoRoutes = require('./routes/authDemo');
const stockRoutes = require('./routes/stocks');
const stocksDemoRoutes = require('./routes/stocksDemo');

// Error handling middlewares
const { errorHandler, notFound } = require('./middlewares/error');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the database
connectDB();

// Setup Session Management with MongoDB Store
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/finsight' }),
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    secure: false,
    httpOnly: true
  }
}));

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static file serving
app.use(express.static(path.join(__dirname, '..', 'public')));

// Set EJS as the view engine
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

// Simple home route
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/demo/dashboard');
  } else {
    res.redirect('/demo/login');
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/stocks', stockRoutes);

// Demo routes
app.use('/demo', authDemoRoutes);
app.use('/stocks', stocksDemoRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
  console.log(`Stock Market: http://localhost:${PORT}/stocks/market`);
});

module.exports = app;