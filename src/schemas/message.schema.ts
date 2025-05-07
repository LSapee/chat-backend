import mongoose from 'mongoose';

export const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    senderId: {
      type: String,
      ref: "User",
      required: true,
    },
    text:{
      type: String,
    },
    imageUrl: {
      type: String,
    },
  },
  {timestamps: true},
)
