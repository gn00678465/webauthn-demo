import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme.ts";
import MainLayout from "./MainLayout.tsx";
import WebAuthnContext from "./WebAuthnContent.tsx";
import ErrorPage from "./404.tsx";
import PasskeysManagePage from "./PasskeysManagePage.tsx";

import "@unocss/reset/tailwind-compat.css";
import "./index.css";
import "virtual:uno.css";

// 路由對齊 /.well-known/passkey-endpoints 廣告的網址：
// enroll → /passkeys/create、manage → /passkeys
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <WebAuthnContext />,
        loader: () => {
          return "login";
        }
      },
      {
        path: "passkeys/create",
        element: <WebAuthnContext />,
        loader: () => {
          return "enroll";
        }
      },
      {
        path: "register",
        element: <Navigate to="/passkeys/create" replace />
      }
    ],
    errorElement: <ErrorPage />
  },
  {
    path: "/passkeys",
    element: (
      <MainLayout>
        <PasskeysManagePage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: "/home",
    element: <Navigate to="/passkeys" replace />
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
