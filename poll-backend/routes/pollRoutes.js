import express from "express";
import {
  createPoll,
  getPolls,
  votePoll,
  closePoll,
  deletePoll
} from "../controllers/pollController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getPolls);
router.post("/", protect, adminOnly, createPoll);
router.post("/vote", protect, votePoll);
router.put("/close/:id", protect, adminOnly, closePoll);
router.delete("/:id", protect, adminOnly, deletePoll);
export default router;