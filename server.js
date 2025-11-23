const mongoose = require('mongoose');
const nodenv = require('dotenv');

nodenv.config({ path: `./config.env` });

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE;

// Connection with proper options
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('DB connection successful! ✅');
  })
  .catch(err => {
    console.error('DB connection error 💥:', err);
    console.error('Connection string:', DB.replace(/Test1234/g, '***')); // log without password
  });

mongoose.set('strictQuery', true);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('unhandledRejection shutting down');
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
