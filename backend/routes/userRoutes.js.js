import express from "express";
import {
  registerUser,
  loginUser,
  allUsers,
  updateUserProfile,
  updateProfilePic,
  getUserProfile
} from "../controllers/usercontroller.js";
import protect from "../middleware/authentication.js";

// define paths
const router = express.Router();
router.route("/").get(protect, allUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
// When a PUT request comes to /api/user/update-profile
// It will be protected and then run the updateUserProfile controller

router.put("/update-pic", protect, updateProfilePic);
router.put("/update-profile", protect, updateUserProfile);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect,updateUserProfile );

export default router;
