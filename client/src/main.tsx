import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./pages/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Auth from "./pages/Auth";
import PageContainer from "./PageContainer";
import { login } from "./api/auth";
import { UserProvider } from "./providers/UserProvider";
import Chat from "./pages/Chat";
import Friends from "./pages/Friends";
import { users } from "./api/users";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PageContainer page={<Home />} />,
  },
  {
    path: "/login",
    element: <PageContainer page={<Auth />} />,
    action: login,
  },
  {
    path: "/chat/:chatId",
    element: <PageContainer page={<Chat />} />,
  },
  {
    path: "/friends",
    element: <PageContainer page={<Friends />} />,
    action: users,
  },
]);

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <RouterProvider router={router} />
  </UserProvider>,
);
