import { Discussion, DoorOpenAlt, Group } from "@boxicons/react";
import MenuLink from "./components/MenuLink";
import { useEffect, useState, type ReactNode } from "react";
import { getUserData, logout } from "./api/auth";
import { useUserContext } from "./providers/UserProvider";
import { useWSContext } from "./providers/WSProvider";
import { WSService } from "./api/ws";
import { Link, useNavigate } from "react-router-dom";
import Popup from "./components/Popup";
import Loading from "./components/Loading";
import Avatar from "./components/Avatar";

export default function PageContainer({ page }: { page?: ReactNode }) {
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();
  const [userLoaded, setUserLoaded] = useState(false);
  const [loading, setLoading] = useState(user === null);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { service, setService } = useWSContext();

  useEffect(() => {
    if (!user) {
      getUser();
    }
  }, []);

  useEffect(() => {
    connectToWS();

    return () => {
      service?.closeConnection();
      setService((currentService) =>
        currentService === service ? null : currentService,
      );
    };
  }, [user, setService]);

  async function getUser() {
    const res = await getUserData();
    setLoading(false);
    if (!res) {
      navigate("/login");
      return;
    }

    setUser(res);
    setUserLoaded(true);
  }

  function connectToWS() {
    if (!user) {
      setService(null);
      return;
    }

    const wsService = new WSService(user._id);
    wsService.onClose = receiveWSClose;
    wsService.onError = receiveWSClose;

    setService(wsService);
  }

  function receiveWSClose() {
    setService(null);
  }

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logout();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
      setLogoutError("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div
      className={`grid h-dvh w-screen grid-rows-[minmax(0,1fr)] overflow-hidden bg-slate-50 pb-5 max-sm:grid-cols-1 ${
        user
          ? "grid-cols-[64px_minmax(0,1fr)] max-sm:grid-rows-[minmax(0,1fr)_64px]"
          : "grid-cols-[minmax(0,1fr)]"
      }`}
    >
      {!service && userLoaded && user !== null && (
        <Popup
          title={
            <>
              <b>Oops!</b>
              <br />
            </>
          }
          actions={[
            {
              label: "Reconnect",
              onClick: connectToWS,
              closeBeforeAction: true,
            },
          ]}
        >
          Looks like you've lost connection to the server...
        </Popup>
      )}

      {user && (
        <section
          className={`
          z-30 flex h-full w-16 flex-col items-center gap-2 border-r border-slate-700 bg-slate-800 px-2 py-3 text-slate-300
          max-sm:row-start-2 max-sm:h-16 max-sm:w-full max-sm:flex-row max-sm:justify-around max-sm:border-r-0 max-sm:border-t max-sm:border-slate-700 max-sm:px-2 max-sm:py-1
        `}
        >
          {user !== null && (
            <Link to={"/account"}>
              <Avatar
                className="mb-2 aspect-square h-10 w-10 rounded-lg ring-1 ring-slate-600 max-sm:mb-0 max-sm:h-9 max-sm:w-9"
                user={user}
                alt={user.username}
              />
            </Link>
          )}

          {user !== null && (
            <>
              <MenuLink
                to={"/"}
                className="h-11 w-11 justify-center px-0 py-0 max-sm:h-12 max-sm:w-12"
                title="Chats"
              >
                <Discussion className="h-5 w-5 scale-150" />
              </MenuLink>
              <MenuLink
                to={"/friends"}
                className="h-11 w-11 justify-center px-0 py-0 max-sm:h-12 max-sm:w-12"
                title="Friends"
              >
                <Group className="h-5 w-5 scale-150" />
              </MenuLink>
              <button
                type="button"
                className="mt-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 max-sm:mt-0 max-sm:h-12 max-sm:w-12"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title={isLoggingOut ? "Logging out..." : "Logout"}
                aria-label={isLoggingOut ? "Logging out..." : "Logout"}
              >
                <DoorOpenAlt className="h-5 w-5" />
              </button>
            </>
          )}

          {user === null && (
            <MenuLink to={"/login"} className="flex w-full justify-center py-4">
              Login
            </MenuLink>
          )}
          {logoutError && (
            <p
              className="w-full rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-800"
              role="alert"
            >
              {logoutError}
            </p>
          )}
        </section>
      )}

      {loading && <Loading />}
      {page}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-6 bg-slate-800 flex justify-end items-center">
        <span className="text-xs text-slate-400">
          Maksymilian Olejnik 2026 &#169;
        </span>
      </div>
    </div>
  );
}
