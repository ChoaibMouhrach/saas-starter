import "./index.css";
import { StrictMode } from "react";
import { routeTree } from "./routes";
import { createRoot } from "react-dom/client";
import { CustomProvider } from "./custom-provider";
import { createRouter, RouterProvider } from "@tanstack/react-router";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CustomProvider>
      <RouterProvider router={router} />
    </CustomProvider>
  </StrictMode>
);
