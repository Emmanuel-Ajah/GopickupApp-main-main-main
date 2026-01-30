const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    riderName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    experience: {
      type: String, // e.g., "Terrible", "Bad", "Okay", "Good", "Excellent"
      required: true,
    },
    feedback: {
      type: String,
    },
    tags: [
      {
        type: String, // e.g., "Communication", "Hygiene", "Handoff"
      },
    ],
    tip: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Review", reviewSchema);
