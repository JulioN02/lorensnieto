import { app, config } from './app.js';

const server = app.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🏠  Lorens Nieto — Backend API                    ║
║                                                      ║
║   Entorno: ${config.nodeEnv.padEnd(42)}║
║   Puerto:   ${String(config.port).padEnd(42)}║
║   Health:   http://localhost:${config.port}/api/health        ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n⏳ Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
