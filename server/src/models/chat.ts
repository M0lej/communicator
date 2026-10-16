import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user";
export interface IChat extends Document {
  users: mongoose.Types.ObjectId[];
  userNames: string[];
  getChatsByUserId(userId: string): Promise<IChat>;
  getChatById(id: string): Promise<IChat>;
  createNewChat(userId: string, otherId: string): Promise<IChat>;
}

const ChatSchema: Schema = new mongoose.Schema({
  users: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
  userNames: [{ type: String, required: true }],
});

const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);

export const getChatsByUserId = async (userId: string) =>
  await ChatModel.find({ users: userId });

export const getChatById = async (id: string): Promise<IChat | null> =>
  await ChatModel.findById(id);

export const _getChatByUserIds = async (
  userId: string,
  otherId: string,
): Promise<IChat | null> =>
  await ChatModel.findOne({
    users: {
      $all: [userId, otherId],
    },
  });

export const createNewChat = async (
  user: IUser,
  otherUser: IUser,
): Promise<IChat | null> =>
  new ChatModel({
    users: [user._id, otherUser._id],
    userNames: [user.username, otherUser.username],
  })
    .save()
    .then((chat) => chat.toObject());
