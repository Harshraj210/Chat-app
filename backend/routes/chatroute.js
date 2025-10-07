import express from "express"
import protect from "../middleware/authentication.js"

import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  
} from '../controllers/chatcontroller.js';
const router = express.Router();

// This route handles two different methods:
// POST: To create or access a one-on-one chat.
// GET: To fetch all chats for the logged-in user.
router.route('/')
  .post(protect, accessChat)
  .get(protect, fetchChats);


router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup)

export default router;