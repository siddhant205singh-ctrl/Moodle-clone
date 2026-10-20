require('dotenv').config();
const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes       = require('./routes/auth');
const userRoutes       = require('./routes/users');
const categoryRoutes   = require('./routes/categories');
const courseRoutes     = require('./routes/courses');
const gradeRoutes      = require('./routes/grades');
const calendarRoutes   = require('./routes/calendar');
const ebookRoutes      = require('./routes/ebooks');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');

const app = express();

// Middleware
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.CLIENT_URL,          // e.g. https://kiet-lms.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/categories',  categoryRoutes);
app.use('/api/courses',     courseRoutes);
app.use('/api/grades',      gradeRoutes);
app.use('/api/calendar',    calendarRoutes);
app.use('/api/ebooks',      ebookRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB Atlas then start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
