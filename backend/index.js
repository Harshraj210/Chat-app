import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import connectDB from "./config/db.js";
import userRoutes from "./routes/route.js";
import chatRoute from "./routes/chatroute.js"
import messageRoutes from "./routes/messageRoutes.js";

// execute database connection
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("api is running");
});
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
