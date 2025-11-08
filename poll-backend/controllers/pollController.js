import { Poll } from "../models/Poll.js";

export const createPoll = async (req, res) => {
  try {
    const { question, options, closingTime } = req.body;
    const poll = await Poll.create({
      question,
      options: options.map((text) => ({ text })),
      closingTime,
      createdBy: req.user._id
    });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPolls = async (req, res) => {
  const polls = await Poll.find().populate("createdBy", "username");
  res.json(polls);
};

export const votePoll = async (req, res) => {
  const { pollId, optionIndex } = req.body;
  const poll = await Poll.findById(pollId);
  if (!poll) return res.status(404).json({ message: "Poll not found" });
  if (poll.isClosed || new Date() > poll.closingTime)
    return res.status(400).json({ message: "Poll is closed" });
  if (poll.voters.includes(req.user._id))
    return res.status(400).json({ message: "You have already voted" });
  poll.options[optionIndex].votes += 1;
  poll.voters.push(req.user._id);
  await poll.save();
  res.json({ message: "Vote recorded", poll });
};

export const closePoll = async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ message: "Poll not found" });
  poll.isClosed = true;
  await poll.save();
  res.json(poll);
};

export const deletePoll = async (req, res) => {
  await Poll.findByIdAndDelete(req.params.id);
  res.json({ message: "Poll deleted" });
};