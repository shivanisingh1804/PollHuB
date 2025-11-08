import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 }
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  closingTime: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isClosed: { type: Boolean, default: false },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

export const Poll = mongoose.model("Poll", pollSchema);