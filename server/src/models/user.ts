import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  sentFriendRequests: mongoose.Types.ObjectId[];
  pendingFriendRequests: mongoose.Types.ObjectId[];
  friends: mongoose.Types.ObjectId[];
  sendFriendRequest(otherId: string): Promise<IUser>;
  removeFriend(otherId: string): Promise<IUser>;
  receiveFriendRequest(otherId: string): Promise<IUser>;
  acceptFriendRequest(otherId: string): Promise<IUser>;
  receiveFriendRequest(otherId: string): Promise<IUser>;
  receiveFriendRequestAccept(otherId: string): Promise<IUser>;
  removePendingFriendRequest(otherId: string): Promise<IUser>;
  removeSentFriendRequest(otherId: string): Promise<IUser>;
}

export interface IUserWithAuth extends IUser {
  authentication: {
    salt: string;
    password: string;
    sessionToken: string;
  };
}

const UserSchema: Schema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  sentFriendRequests: [{ type: Schema.ObjectId, ref: "User" }],
  pendingFriendRequests: [{ type: Schema.ObjectId, ref: "User" }],
  friends: [{ type: Schema.ObjectId, ref: "User" }],
  authentication: {
    salt: { type: String, select: false },
    password: { type: String, select: false },
    sessionToken: { type: String },
  },
});

UserSchema.methods.removeFriend = async function (
  this: IUser,
  otherId: string,
): Promise<IUser> {
  const index = this.friends.findIndex((id: mongoose.Types.ObjectId) =>
    id.equals(otherId),
  );

  this.friends.splice(index, 1);

  await this.save();

  return this;
};

UserSchema.methods.sendFriendRequest = async function (
  this: IUser,
  otherId: string,
): Promise<IUser> {
  this.sentFriendRequests.push(new mongoose.Types.ObjectId(otherId));

  await this.save();

  return this;
};

UserSchema.methods.receiveFriendRequest = async function (
  this: IUser,
  otherId: string,
): Promise<IUser> {
  this.pendingFriendRequests.push(new mongoose.Types.ObjectId(otherId));

  await this.save();

  return this;
};

UserSchema.methods.acceptFriendRequest = async function (
  this: IUser,
  otherId: string,
): Promise<IUser> {
  const index = this.pendingFriendRequests.findIndex(
    (id: mongoose.Types.ObjectId) => id.equals(otherId),
  );

  this.pendingFriendRequests.splice(index, 1);
  this.friends.push(new mongoose.Types.ObjectId(otherId));

  await this.save();

  return this;
};

UserSchema.methods.receiveFriendRequestAccept = async function (
  this: IUser,
  otherId: string,
): Promise<IUser> {
  const index = this.sentFriendRequests.findIndex(
    (id: mongoose.Types.ObjectId) => id.equals(otherId),
  );

  this.sentFriendRequests.splice(index, 1);
  this.friends.push(new mongoose.Types.ObjectId(otherId));

  await this.save();

  return this;
};

UserSchema.methods.removePendingFriendRequest = async function (
  this: IUser,
  otherId: string,
): Promise<IUser> {
  const index = this.pendingFriendRequests.findIndex(
    (id: mongoose.Types.ObjectId) => id.equals(otherId),
  );

  this.pendingFriendRequests.splice(index, 1);

  await this.save();

  return this;
};

UserSchema.methods.removeSentFriendRequest = async function (
  this: IUser,
  otherId: string,
): Promise<IUser> {
  const index = this.sentFriendRequests.findIndex(
    (id: mongoose.Types.ObjectId) => id.equals(otherId),
  );

  this.sentFriendRequests.splice(index, 1);

  await this.save();

  return this;
};

export const UserModel = mongoose.model<IUser>("User", UserSchema);

export const getUsers = () => UserModel.find();

export const getUserByEmail = (email: string) => UserModel.findOne({ email });

export const getUserById = (id: string) => UserModel.findById(id);

export const getUserBySessionToken = (sessionToken: string) =>
  UserModel.findOne({ "authentication.sessionToken": sessionToken });

export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user: IUser) => user.toObject());

export const isFriendRequestPending = (currentUser: IUser, otherId: string) =>
  currentUser.pendingFriendRequests.findIndex((id: mongoose.Types.ObjectId) =>
    id.equals(otherId as string),
  ) !== -1;

export const doesFriendExist = (currentUser: IUser, otherId: string) =>
  currentUser.friends.findIndex((id: mongoose.Types.ObjectId) =>
    id.equals(otherId as string),
  ) !== -1;
