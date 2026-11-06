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
    <div className="w-screen h-screen max-sm:flex flex-col grid grid-cols-[auto_1fr] grid-rows-1">
      {!service && userLoaded && (
        <div className="absolute w-full h-full backdrop-blur-md z-10 flex flex-col justify-center items-center">
          <p>
            <b>Oops!</b>
            <br />
            Looks like you've lost connection to the server...
          </p>
          <button
            className="my-4 bg-blue-400 text-white px-4 py-2 rounded-lg cursor-pointer"
            onClick={connectToWS}
          >
            Reconnect
          </button>
        </div>
      )}
      <button
        className={`
          fixed 
          ${!expanded ? "left-5" : "max-sm:left-5 left-50"} 
          cursor-pointer 
          transition-all 
          z-20
          top-5
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
          ${!expanded ? "max-w-0" : "max-sm:max-w-full max-w-60"} 
        bg-red-400 
          transition-all
          flex
          flex-col
          items-center
          overflow-hidden
          pt-15
          gap-2
          z-10
        `}
      >
        {user !== null && <h1>Logged in as {user.username}</h1>}

        {user !== null && (
          <>
            <MenuLink
              to={"/"}
              className="flex w-full justify-center py-5"
              onClick={hideMenu}
            >
              Chats
            </MenuLink>
            <MenuLink
              to={"/friends"}
              className="flex w-full justify-center py-5"
              onClick={hideMenu}
            >
              Friends
            </MenuLink>
            {user != null && (
              <MenuLink
                to={"/account"}
                className="flex w-full justify-center py-5"
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
            className="flex w-full justify-center py-5"
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
