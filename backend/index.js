require('dotenv').config({ path: '.env' });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const uploadRoutes = require("./routes/upload");
const paymentRoutes = require("./routes/payment");
const messageRoutes = require("./routes/messages");
const cartRoutes = require("./routes/cart");
const adminRoutes = require("./routes/admin");

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("PustakHub Backend is Running!");
});

// Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("join_room", (room) => {
    socket.join(room);
  });
  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });
  socket.on("delete_message", (data) => {
    io.to(data.room).emit("message_deleted", data.messageId);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Database connection
const mongoURI = "mongodb://localhost:27017/pustakhub";
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.log("DB Error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});