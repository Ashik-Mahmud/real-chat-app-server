const app = require("./app");
const io = require("socket.io");
require("colors");

/* Error Handling */
app.get("/", (req, res) => {
  res.send({ success: true, message: "Welcome to CHAT API..." });
});

app.get("*", (req, res) => {
  res.status(404).json({ msg: "Page Not Found" });
});

/* 404 route */
app.use((err, req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found" + err.message,
  });
  next();
});

/* 500 route */
app.use((req, res, next) => {
  const error = new Error("Not Found");
  res.json({
    success: false,
    message: "Internal Server Error",
  });
  error.status = 404;
  next(error);
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

/* start server */
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`.blue.bold);
});

/* socket.io connection */
const socketServer = io(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socketServer.on("connection", (socket) => {
  console.log("New client connected");

  /* setup room for chat */
  socket.on("setup", (data) => {
    socket.join(data._id);
    console.log(data?._id);
  });

  /* create another room for joining chat */
  socket.on("join_chat", (room) => {
    socket.join(room);
    console.log(`User Join to room - ` + room);
  });

  /* send new message for real time */
  socket.on("new_message", (newMessage) => {
    const chat = newMessage?.chat;
    if (!chat?.users) return console.log(`chat is not available`);
    chat.users.forEach((user) => {
      if (user == newMessage?.sender) return;
      socket.in(user).emit("message_received", newMessage);
    });
  });

  /* adding typing indicator */
  socket.on("typing", (room) => {    
    if(!room)return console.log('not found room');
    socket.in(room).emit("isTyping", room);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
