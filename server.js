const mongoose = require('mongoose');
const nodenv = require('dotenv');

nodenv.config({ path: `./config.env` });
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require('./app');

//console.log(process.env)
//const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE;
//const DB = process.env.DATABASE_LOCAL;
mongoose.connect(DB).then(() => console.log('DB successful'));
mongoose.set('strictQuery', true);
//Start Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err => {
  // console.log(err);
  console.log(err.name, err.message);
  console.log('unhandledRejection shating down');
  server.close(() => {
    process.exit(1);
  });
});
