import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import supportRoutes from './routes/supportRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import financeRoutes from './routes/financeRoutes';
import taskRoutes from './routes/taskRoutes';
import chatRoutes from './routes/chatRoutes';
import calendarRoutes from './routes/calendarRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/calendar', calendarRoutes);



app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend service is healthy' });
});


app.get('/', (req, res) => {
  res.send('DigiAmplify Backend Service API');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
