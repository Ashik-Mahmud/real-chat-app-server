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
const chatRouter = require("./routes/chatRoutes")
const ConnectedDB = require('./Utils/DatabaseConnection');


/* connection */
ConnectedDB();


/* apply routes */

/* user route */
app.use('/api/user', userRouter);

/* chat route */
app.use("/api/chat", chatRouter)






module.exports = app;
