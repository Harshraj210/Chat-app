import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/route.js";
dotenv.config();
// execute database connection
connectDB();
const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("api is running");
});
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
