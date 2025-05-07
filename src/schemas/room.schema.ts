import mongoose from 'mongoose';

export const roomSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      ref: "User",
      required: true,
    },
    receiverId:{
      type: String,
      ref: "User",
      required: true,
    }
  },
  {timestamps: true},
)