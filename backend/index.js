import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/route.js";
import chatRoute from "./routes/chatroute.js";
import messageRoutes from "./routes/messageRoutes.js";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const app = express();
 app.use(cors());
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true,
// }));

app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

const io = new Server(server, {
  // if no message comes from a client for 1 min disconnect it
  pingTimeout: 60000,
  cors: {
    origin:"*"
    // origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected via socket.");

  socket.on("setup", (userData) => {
    // joins a room named by that user id.
    socket.join(userData.user._id);
      console.log(`User ${userData.user.name} set up their personal room.`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("new message", (newMessageReceived) => {
    console.log("Backend received 'new message' event with:", newMessageReceived.content);
    let chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");

    // chat.users --> list of people in that chat
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      console.log(`Broadcasting message to user: ${user.name}`);
      
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
  });
});

