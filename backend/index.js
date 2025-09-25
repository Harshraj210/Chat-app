import express from "express";
import dotenv from "dotenv";
dotenv.config();  
import connectDB from "./config/db.js";
import userRoutes from "./routes/route.js";

// execute database connection
connectDB();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("api is running");
});
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
