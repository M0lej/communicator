import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./pages/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Auth from "./pages/Auth";
import PageContainer from "./PageContainer";
import { login } from "./api/auth";
import { UserProvider } from "./providers/UserProvider";
import Friends from "./pages/Friends";
import { updateUser, users } from "./api/users";
import Account from "./pages/Account";
import { WSProvider } from "./providers/WSProvider";

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
    path: "/friends",
    element: <PageContainer page={<Friends />} />,
    action: users,
  },
  {
    path: "/account",
    element: <PageContainer page={<Account />} />,
    action: updateUser,
  },
]);

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <WSProvider>
      <RouterProvider router={router} />
    </WSProvider>
  </UserProvider>,
);
