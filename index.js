const app = require("./app");
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
app.listen(port, () => {
  console.log(`Server started on port ${port}`.blue.bold);
});
