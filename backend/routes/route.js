import express from "express";
import {
  registerUser,
  loginUser,
  updateProfile,
  getUserProfile,
  allUsers
} from "../controllers/usercontroller.js";
import protect from "../middleware/authentication.js";

// define paths
const router = express.Router();
router.route("/").get(protect,allUsers)
router.post("/register", registerUser);
router.post("/login", loginUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateProfile);

export default router;
