import express from "express"
import {registerUser, loginUser, updateProfile , getUserProfile} from "../controllers/usercontroller.js"

// define paths
const router = express.Router()

