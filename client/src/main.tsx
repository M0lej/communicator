import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Auth from "./Auth";
import PageContainer from "./PageContainer";
import { login } from "./api/auth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PageContainer page={<Home />} />,
  },
  {
    path: "/login",
    element: <PageContainer page={<Auth />} />,
    action: login
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
