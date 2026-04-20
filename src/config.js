const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  dataDir: DATA_DIR,
  dbPath: process.env.DB_PATH || path.join(DATA_DIR, 'diary.db'),
  sessionDbPath: process.env.SESSION_DB_PATH || path.join(DATA_DIR, 'sessions.db'),
  isProduction: process.env.NODE_ENV === 'production',
};
