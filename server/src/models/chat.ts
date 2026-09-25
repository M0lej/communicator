import mongoose, { Document, Schema } from "mongoose";
export interface IChat extends Document {
  users: mongoose.Types.ObjectId[];
  getChatsByUserId(userId: string): Promise<IChat>;
  getChatById(id: string): Promise<IChat>;
  createNewChat(userId: string, otherId: string): Promise<IChat>;
}

const ChatSchema: Schema = new mongoose.Schema({
  users: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
});

const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);

export const getChatsByUserId = async (userId: string) =>
  await ChatModel.find({ users: userId });

export const getChatById = async (id: string): Promise<IChat | null> =>
  await ChatModel.findById(id);

export const createNewChat = async (
  userId: string,
  otherId: string,
): Promise<IChat | null> =>
  new ChatModel({
    users: [userId, otherId],
  })
    .save()
    .then((chat) => chat.toObject());
