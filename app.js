const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();


/* apply middle wares */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* imports routes */
const userRouter = require('./routes/userRoutes');

/* apply routes */
app.use('/api', userRouter);




module.exports = app;
