import { Discussion, DoorOpenAlt, Group, Menu, User } from "@boxicons/react";
import MenuLink from "./components/MenuLink";
import { useEffect, useState, type ReactNode } from "react";
import { getUserData, logout } from "./api/auth";
import { useUserContext } from "./providers/UserProvider";
import { useWSContext } from "./providers/WSProvider";
import { WSService } from "./api/ws";
import { useNavigate } from "react-router-dom";
import Popup from "./components/Popup";
import { apiUrl } from "./api/client";
import Loading from "./components/Loading";

export default function PageContainer({ page }: { page?: ReactNode }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();
  const [userLoaded, setUserLoaded] = useState(false);
  const [loading, setLoading] = useState(user === null);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { service, setService } = useWSContext();
  const hideMenu = () => setExpanded(false);

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
      hideMenu();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
      setLogoutError("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="grid h-dvh w-screen grid-cols-[auto_1fr] grid-rows-1 overflow-hidden bg-slate-50 max-sm:flex max-sm:flex-col">
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
      <button
        className={`
          fixed 
          ${!expanded ? "left-5" : "max-sm:left-5 left-45"}
          cursor-pointer 
          transition-all 
          z-20 rounded-lg border border-blue-100 bg-white p-2 text-blue-800 shadow-sm
          top-2.5
        `}
        onClick={() => setExpanded(!expanded)}
        aria-label={expanded ? "Close menu" : "Open menu"}
        aria-expanded={expanded}
      >
        <Menu />
      </button>
      <section
        className={`
          h-full
          max-sm:fixed
          max-sm:w-full
          w-60
          ${!expanded ? "max-w-0 px-0 border-r-0" : "max-sm:max-w-full max-w-60 px-3 border-r"}
          rounded-r-2xl border-blue-800 bg-blue-900 text-white shadow-lg
          transition-all
          flex
          flex-col
          items-center
          overflow-hidden
          pt-20
          gap-1
          z-10
        `}
      >
        {user !== null && (
          <>
            <img
              className="rounded-full aspect-square h-20 mb-5 drop-shadow-xl shadow-md"
              src={apiUrl(`/api/avatar/${encodeURIComponent(user._id)}`)}
            />
            <h1 className="mb-3 w-full truncate px-3 text-center text-sm font-medium text-blue-100">
              Logged in as{" "}
              <span className="font-bold text-white">{user.username}</span>
            </h1>
          </>
        )}

        {user !== null && (
          <>
            <MenuLink
              to={"/"}
              className="flex w-full justify-center py-4"
              onClick={hideMenu}
            >
              <Discussion />
              Chats
            </MenuLink>
            <MenuLink
              to={"/friends"}
              className="flex w-full justify-center py-4"
              onClick={hideMenu}
            >
              <Group />
              Friends
            </MenuLink>
            <MenuLink
              to={"/account"}
              className="flex w-full justify-center py-4"
              onClick={hideMenu}
            >
              <User />
              Account
            </MenuLink>
            <button
              type="button"
              className="flex w-full cursor-pointer justify-center gap-2 rounded-lg border border-transparent px-4 py-4 text-center font-medium text-blue-100 transition-colors duration-150 hover:border-blue-500 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <DoorOpenAlt />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </>
        )}

        {user === null && (
          <MenuLink
            to={"/login"}
            className="flex w-full justify-center py-4"
            onClick={hideMenu}
          >
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
      {loading && <Loading />}
      {page}
    </div>
  );
}
