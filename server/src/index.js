import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import { isInitialized } from './config/firebase.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`=========================================`);
  logger.info(`  Saaryans API Server started`);
  logger.info(`  Environment : ${config.env}`);
  logger.info(`  Port        : ${PORT}`);
  logger.info(`  Health check: http://localhost:${PORT}/api/v1/health`);
  logger.info(`  Firebase    : ${isInitialized ? 'Connected' : 'Pending Credentials'}`);
  logger.info(`=========================================`);
});

// Handle graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Force close after 10s if remaining connections hang
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
