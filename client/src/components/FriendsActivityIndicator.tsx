import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { getFriends, type IUserWithStatus } from "../api/users";
import { useUserContext } from "../providers/UserProvider";
import UserStatusIndicator from "./UsersStatusIndicator";
import UserStatusIndicatorSkeleton from "./UserStatusIndicatorSkeleton";
import type { IWSIncomingActive } from "../api/ws";

export interface FriendsActivityIndicatorHandle {
  refreshFriends: (data: IWSIncomingActive) => Promise<void>;
}

interface FriendsActivityIndicatorProps {
  onClick: (friend: IUserWithStatus) => void;
}

export const FriendsActivityIndicator = forwardRef(
  ({ onClick }: FriendsActivityIndicatorProps, ref) => {
    const { user } = useUserContext();
    const [friends, setFriends] = useState<IUserWithStatus[]>([]);
    const [isFriendsLoading, setIsFriendsLoading] = useState(true);

    useEffect(() => {
      async function fetchFriends() {
        const res = await getFriends();
        setIsFriendsLoading(false);

        if (res) {
          setFriends(res);
        }
      }

      void fetchFriends();
    }, [user]);

    function refreshFriends(data: IWSIncomingActive) {
      const friendUserWithStatus: IUserWithStatus = {
        ...data.content.sender,
        status: data.content.content,
      };
      setFriends((users) =>
        users
          .map((friendUser: IUserWithStatus) => {
            if (friendUser._id === friendUserWithStatus._id) {
              return friendUserWithStatus;
            } else {
              return friendUser;
            }
          })
          .sort((userA, userB) => Number(userB.status) - Number(userA.status)),
      );
    }

    useImperativeHandle(ref, () => ({ refreshFriends }), [refreshFriends]);
    return (
      <section className="border-b border-slate-200 px-6 py-4 sm:px-10">
        {friends && (
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Friends</h2>
        )}
        <div className="flex gap-4 overflow-x-auto pb-1">
          {isFriendsLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <UserStatusIndicatorSkeleton key={index} />
              ))
            : user &&
              friends.map((friend) => (
                <UserStatusIndicator
                  user={friend}
                  key={friend._id}
                  onClick={() => onClick(friend)}
                />
              ))}
        </div>
      </section>
    );
  },
);
