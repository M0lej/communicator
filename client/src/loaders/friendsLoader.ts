import {
  getFriends,
  getPendingFriendRequests,
  getSentFriendRequests,
} from "../api/users";

export function friendsLoader() {
  return {
    friends: getFriends(),
    sentRequests: getSentFriendRequests(),
    pendingRequests: getPendingFriendRequests(),
  };
}
