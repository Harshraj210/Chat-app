import express from "express"
import protect from "../middleware/authentication.js"

import {
  accessChat,
  fetchChats,
  createGroupChat,
  
} from '../controllers/chatController.js';
const router = express.Router();

// This route handles two different methods:
// POST: To create or access a one-on-one chat.
// GET: To fetch all chats for the logged-in user.
router.route('/')
  .post(protect, accessChat)
  .get(protect, fetchChats);


router.route('/group').post(protect, createGroupChat);



export default router;