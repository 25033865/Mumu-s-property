"use client";

import { useMemo } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routeConfig } from "./routes";

export default function App() {
  const router = useMemo(() => createBrowserRouter(routeConfig), []);

  return <RouterProvider router={router} />;
}