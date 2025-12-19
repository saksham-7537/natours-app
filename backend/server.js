import dotenv from 'dotenv'; 

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './config.env' });
}

import app from './index.js';
// older version
app.set('query parser', 'extended');
import connectDb from './db/createDb.js';

// mongodb
const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

connectDb(DB)

// console.log(app.get('env'))
// console.log(process.env)

// listening to server
const port = process.env.PORT || 8000;
app.listen(port, () => console.log('Server Up!'));

// handling unhandled rejection
