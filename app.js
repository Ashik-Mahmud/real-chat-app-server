const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

/* apply middle wares */
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* imports routes */
const userRouter = require("./routes/userRoutes");
const chatRouter = require("./routes/chatRoutes");
const ConnectedDB = require("./Utils/DatabaseConnection");

/* connection */
ConnectedDB();

/* apply routes */

/* user route */
app.use("/api/user", userRouter);

/* chat route */
app.use("/api/chat", chatRouter);

module.exports = app;
