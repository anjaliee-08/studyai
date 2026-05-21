const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://studyai-kjvz.vercel.app' // replace after Vercel deploy
  ],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/goals',    require('./routes/goalRoutes'));
app.use('/api/pomodoro', require('./routes/pomodoroRoutes'));
app.use('/api/ai',       require('./routes/aiRoutes'));

// Health check route
app.get('/', (req, res) => res.send('StudyAI API is running ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));