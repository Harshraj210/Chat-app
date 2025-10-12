import React, { useState, useEffect } from "react";
import axios from "axios";
import { useChatState } from "../context/ChatProvider";
import { Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
