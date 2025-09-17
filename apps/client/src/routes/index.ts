import { rootRoute } from "./root";
import { mainRouteTree } from "./main";
import { authRouteTree } from "./auth";
import { dashboardRouteTree } from "./dashboard";

export const routeTree = rootRoute.addChildren([
  mainRouteTree,
  authRouteTree,
  dashboardRouteTree,
]);
