// file_path : config/index.js

module.exports  = {
  SERVER_PORT: process.env.SERVER_PORT || 3000,
  REDIS: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASS,
  },
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || '$2b$10$X9K3YqH7qH.Z5QZ4Z5QZ5O', // default: "admin123"
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  SERVER_TIMEOUT: 45000,
};