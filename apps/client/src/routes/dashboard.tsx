import { rootRoute } from "./root";
import { DashboardLayout } from "@/pages/(dashboard)/layout";
import {
  createRoute,
  isRedirect,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { DashboardPage } from "@/pages/(dashboard)/dashboard/page";
import { Settings } from "@/pages/(dashboard)/settings/page";
import { api } from "@/api";
import { CustomApiError } from "@/lib/base-api";

export const dashboardLayout = createRoute({
  id: "dashboard-layout",
  getParentRoute: () => rootRoute,
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
  beforeLoad: async () => {
    try {
      const auth = await api.auth.getAuthUser();

      if (!auth.user.confirmedAt) {
        throw redirect({
          to: "/pending-email-confirmation",
        });
      }

      return auth;
    } catch (error) {
      if (error instanceof CustomApiError && error.statusCode === 401) {
        throw redirect({
          to: "/sign-in",
        });
      }

      if (isRedirect(error)) {
        throw error;
      }

      throw redirect({
        to: "/error",
      });
    }
  },
});

export const dashboardRoute = createRoute({
  path: "/dashboard",
  getParentRoute: () => dashboardLayout,
  component: () => <DashboardPage />,
});

export const settingsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  component: () => <Settings />,
  path: "/settings",
});

export const dashboardRouteTree = dashboardLayout.addChildren([
  dashboardRoute,
  settingsRoute,
]);
