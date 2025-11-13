// config/database.js
module.exports = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/wegorent',
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-locationvoiture-app-2024'
};
