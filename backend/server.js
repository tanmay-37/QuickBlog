import dotenv from 'dotenv';
import connectDB from './src/db/index.js';
import { app } from './src/app.js';
import postRouter from './routes/post.routes.js'

dotenv.config({
  path: './.env',
});

// Connect to the database and then start the server
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log('MONGO db connection failed !!! ', err);
  });

/* * ==================
* ROUTES DECLARATION
* ==================
*/

// All requests to /api/v1/users will be handled by userRouter
app.use('/api/v1/users', userRouter);

// All requests to /api/v1/posts will be handled by postRouter
app.use('/api/v1/posts', postRouter);