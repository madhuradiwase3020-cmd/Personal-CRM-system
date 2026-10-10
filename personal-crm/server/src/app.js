import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required; set it in server/.env');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', recordRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDatabase()
  .then(() => app.listen(port, () => console.log(`Personal CRM API listening on port ${port}`)))
  .catch(error => {
    console.error('Unable to start API:', error.message);
    process.exit(1);
  });
