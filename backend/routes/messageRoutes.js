import express from "express"
import protect from "../middleware/authentication.js"
import { allMessages, sendMediaMessage, sendMessage } from "../controllers/messagecontroller.js";

const router = express.Router()
router.route("/:chatId").get(protect,allMessages)
router.route("/").post(protect,sendMessage)
router.route("/media").post(protect,sendMediaMessage)
export default router