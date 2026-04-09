import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '3000', 10),

  database: {
    url: process.env['DATABASE_URL'] ?? '',
  },

  session: {
    secret: process.env['SESSION_SECRET'] ?? 'default-secret-cambiar-en-produccion',
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  },

  smtp: {
    host: process.env['SMTP_HOST'] ?? '',
    port: parseInt(process.env['SMTP_PORT'] ?? '587', 10),
    user: process.env['SMTP_USER'] ?? '',
    pass: process.env['SMTP_PASS'] ?? '',
  },

  frontend: {
    adminUrl: process.env['FRONTEND_ADMIN_URL'] ?? 'http://localhost:5173',
    publicUrl: process.env['FRONTEND_PUBLIC_URL'] ?? 'http://localhost:3001',
  },

  upload: {
    dir: process.env['UPLOAD_DIR'] ?? './uploads',
    maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] ?? '20971520', 10), // 20MB
    maxGallerySize: parseInt(process.env['MAX_GALLERY_SIZE'] ?? '157286400', 10), // 150MB
  },

  app: {
    name: 'Lorens Nieto',
    url: 'https://lorensnieto.com',
  },
} as const;

export type Config = typeof config;
