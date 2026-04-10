require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');

const app = express();

// ── DB ────────────────────────────────────────────────────────────────────────
connectDB();

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/profile',  require('./routes/profile'));
app.use('/api',          require('./routes/lessons'));   // /api/curriculum, /api/lessons
app.use('/api/quizzes',  require('./routes/quizzes'));
app.use('/api',          require('./routes/misc'));      // games, puzzles, achievements, etc.

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
