import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./pages/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import PageContainer from "./PageContainer";
import { login, register } from "./api/auth";
import { UserProvider } from "./providers/UserProvider";
import Friends from "./pages/Friends";
import { updateUser, users } from "./api/users";
import Account from "./pages/Account";
import { WSProvider } from "./providers/WSProvider";
import Register from "./pages/Register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PageContainer page={<Home />} />,
  },
  {
    path: "/login",
    element: <PageContainer page={<Login />} />,
    action: login,
  },
  {
    path: "/register",
    element: <PageContainer page={<Register />} />,
    action: register,
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
