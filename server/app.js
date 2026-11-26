// // Builds the Express app. Kept separate from index.js so tests (and Vercel) can import it
// // without starting a server.
// import cors from 'cors';
// import express from 'express';
// import rateLimit from 'express-rate-limit';
// import helmet from 'helmet';
// import { env } from './config/env.js';
// import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
// import authRoutes from './routes/authRoutes.js';
// import bidRoutes from './routes/bidRoutes.js';
// import taskRoutes from './routes/taskRoutes.js';
// import userRoutes from './routes/userRoutes.js';

// const app = express();

// app.set('trust proxy', 1); // Vercel / Render sit behind a proxy; needed for correct client IPs
// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// app.use(
//   cors({
//     origin(origin, callback) {
//       // No Origin header = curl, Postman or server-to-server; browsers must be on the allow-list.
//       callback(null, !origin || env.CLIENT_URLS.includes(origin));
//     },
//   })
// );
// app.use(express.json({ limit: '50kb' }));

// // Slows down password guessing. (On serverless the counter is per instance, which is fine here.)
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 40,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { error: { message: 'Too many attempts. Please wait a few minutes and try again.' } },
// });

// app.get('/', (_req, res) => res.json({ name: 'ExTask API', status: 'ok' }));
// app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// app.use('/api/auth', authLimiter, authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/bids', bidRoutes);

// app.use(notFoundHandler);
// app.use(errorHandler);

// export default app;



// Builds the Express app. Kept separate from index.js so tests (and Vercel) can import it
// without starting a server.
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const clientDistDir = path.resolve(__dirname, '../../client/dist');
const clientDistDir = path.resolve(__dirname, '../client/dist');

const app = express();

app.set('trust proxy', 1); // Vercel / Render sit behind a proxy; needed for correct client IPs
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = curl, Postman or server-to-server; browsers must be on the allow-list.
      callback(null, !origin || env.CLIENT_URLS.includes(origin));
    },
  })
);
app.use(express.json({ limit: '50kb' }));

// Slows down password guessing. (On serverless the counter is per instance, which is fine here.)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Please wait a few minutes and try again.' } },
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bids', bidRoutes);

// Serve built React frontend in production/single-service deploy (when client/dist exists)
if (fs.existsSync(path.join(clientDistDir, 'index.html'))) {
  app.use(express.static(clientDistDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistDir, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => res.json({ name: 'ExTask API', status: 'ok' }));
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;