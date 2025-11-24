const mongoose = require('mongoose');
const nodenv = require('dotenv');

nodenv.config({ path: `./config.env` });

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE;

console.log('Attempting to connect to DB...');
console.log('DB String (censored):', DB ? 'EXISTS' : 'MISSING');

mongoose
  .connect(DB, {
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    maxPoolSize: 10,
  })
  .then(() => {
    console.log('✅ DB connection successful!');
  })
  .catch(err => {
    console.error('❌ DB connection FAILED!');
    console.error('Error:', err.message);
    console.error('Full error:', err);
  });

mongoose.set('strictQuery', true);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🚀 App running on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});
