import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { HomePage } from "@/pages/home/page";

export const mainLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "main-layout",
});

export const homeRoute = createRoute({
  path: "/",
  component: () => <HomePage />,
  getParentRoute: () => mainLayout,
});

export const mainRouteTree = mainLayout.addChildren([homeRoute]);
