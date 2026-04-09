import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler, attachUser } from './middleware/index.js';

// Routers
import { authRouter } from './api/public/auth.js';
import { publicRouter } from './api/public/index.js';
import { adminRouter } from './api/admin/index.js';

const app = express();

// ============================================
// MIDDLEWARE BASE
// ============================================

// Helmet: headers de seguridad
app.use(helmet());

// Compression gzip
app.use(compression());

// CORS
app.use(
  cors({
    origin: [config.frontend.adminUrl, config.frontend.publicUrl],
    credentials: true,
  })
);

// Parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// SESIONES con PostgreSQL
// ============================================

const pgPool = new pg.Pool({
  connectionString: config.database.url,
});

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      createTableIfMissing: true,
      tableName: 'session',
    }),
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.nodeEnv === 'production',
      httpOnly: true,
      maxAge: config.session.cookieMaxAge,
      sameSite: 'lax',
    },
  })
);

// Adjuntar usuario a request
app.use(attachUser);

// ============================================
// RUTAS PÚBLICAS
// ============================================

app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

export { app, config };
