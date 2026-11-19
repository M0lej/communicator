import { Menu } from "@boxicons/react";
import MenuLink from "./components/MenuLink";
import { useEffect, useState, type ReactNode } from "react";
import { getUserData } from "./api/auth";
import { useUserContext } from "./providers/UserProvider";
import { useWSContext } from "./providers/WSProvider";
import { WSService } from "./api/ws";
import { useNavigate } from "react-router-dom";

export default function PageContainer({ page }: { page?: ReactNode }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();
  const [userLoaded, setUserLoaded] = useState(false);
  const { service, setService } = useWSContext();
  const hideMenu = () => setExpanded(false);

  useEffect(() => {
    getUser();
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

  return (
    <div className="grid h-dvh w-screen grid-cols-[auto_1fr] grid-rows-1 overflow-hidden bg-slate-50 max-sm:flex max-sm:flex-col">
      {!service && userLoaded && (
        <div className="absolute z-30 flex h-full w-full flex-col items-center justify-center bg-slate-950/30 px-6 backdrop-blur-sm">
          <div className="rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-xl">
            <p className="text-slate-700">
              <b>Oops!</b>
              <br />
              Looks like you've lost connection to the server...
            </p>
            <button
              className="my-4 cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              onClick={connectToWS}
            >
              Reconnect
            </button>
          </div>
        </div>
      )}
      <button
        className={`
          fixed 
          ${!expanded ? "left-5" : "max-sm:left-5 left-45"}
          cursor-pointer 
          transition-all 
          z-20 rounded-xl bg-white p-2 text-blue-900 shadow-md
          top-2.5
        `}
        onClick={() => setExpanded(!expanded)}
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
          bg-linear-to-b from-blue-950 via-blue-900 to-blue-800 text-white shadow-xl
          transition-all
          flex
          flex-col
          items-center
          overflow-hidden
          pt-20
          gap-2
          z-10 border-blue-800
        `}
      >
        {user !== null && (
          <h1 className="mb-3 w-full truncate px-3 text-center text-sm font-medium text-blue-100">
            Logged in as{" "}
            <span className="font-bold text-white">{user.username}</span>
          </h1>
        )}

        {user !== null && (
          <>
            <MenuLink
              to={"/"}
              className="flex w-full justify-center py-4"
              onClick={hideMenu}
            >
              Chats
            </MenuLink>
            <MenuLink
              to={"/friends"}
              className="flex w-full justify-center py-4"
              onClick={hideMenu}
            >
              Friends
            </MenuLink>
            {user != null && (
              <MenuLink
                to={"/account"}
                className="flex w-full justify-center py-4"
                onClick={hideMenu}
              >
                Account
              </MenuLink>
            )}
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
      </section>
      {page}
    </div>
  );
}
