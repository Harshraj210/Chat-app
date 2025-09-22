import express from "express"
import dotenv from 'dotenv';
import connectDB from './config/db.js';
dotenv.config()
// execute database connection
connectDB()
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
    res.send('hello');
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});