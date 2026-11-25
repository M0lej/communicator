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
    const [hasFriendsError, setHasFriendsError] = useState(false);

    useEffect(() => {
      let isCurrent = true;

      async function fetchFriends() {
        const res = await getFriends();
        if (!isCurrent) return;

        setIsFriendsLoading(false);

        if (res === null) {
          setHasFriendsError(true);
          return;
        }

        setFriends(res);
      }

      void fetchFriends();

      return () => {
        isCurrent = false;
      };
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
    return isFriendsLoading || hasFriendsError || friends.length > 0 ? (
      <section className="min-w-0 border-b border-slate-200 px-3 py-3">
        {friends.length > 0 && (
          <h2 className="mb-2 text-[13px] font-bold text-slate-700">Friends</h2>
        )}
        <div className="flex w-full min-w-0 gap-4 overflow-x-auto pb-1">
          {isFriendsLoading
            ? Array.from({ length: 3 }, (_, index) => (
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
        {hasFriendsError && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            Unable to load friends. Please try again.
          </p>
        )}
      </section>
    ) : null;
  },
);
