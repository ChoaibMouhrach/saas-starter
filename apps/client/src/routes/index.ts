import { rootRoute } from "./root";
import { mainRouteTree } from "./main";
import { authRouteTree } from "./auth";

export const routeTree = rootRoute.addChildren([mainRouteTree, authRouteTree]);
