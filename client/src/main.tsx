import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Auth from "./Auth";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Auth /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
