import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const MessageModel = mongoose.model("Message", MessageSchema);

export const getMessageById = async (id: string) =>
  await MessageModel.findOne({ id });

export const getLatestMessagesByChatId = async (chatId: string) =>
  await MessageModel.find({ chatId }).sort({ createdAt: -1 }).limit(50);

export const getOlderMessagesByChatId = async (
  chatId: string,
  startIndex: number,
) =>
  await MessageModel.find({ chatId })
    .sort({ createdAt: -1 })
    .skip(startIndex * 50)
    .limit(50);

export const createNewMessage = async (values: Record<string, any>) =>
  await new MessageModel(values).save().then((message) => message.toObject());
