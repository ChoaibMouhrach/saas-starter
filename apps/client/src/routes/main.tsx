import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { HomePage } from "@/pages/home/page";
import { api } from "@/api";
import { CustomApiError } from "@/lib/base-api";
import { ChangeEmailAddressPage } from "@/pages/(public)/change-email-address/page";
import { ConfirmEmailPage } from "@/pages/(public)/confirm-email/page";

export const mainLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "main-layout",
});

export const homeRoute = createRoute({
  path: "/",
  component: () => <HomePage />,
  getParentRoute: () => mainLayout,
  beforeLoad: async () => {
    try {
      await api.auth.getAuthUser();
    } catch (error) {
      if (error instanceof CustomApiError && error.statusCode === 401) {
        throw redirect({
          to: "/sign-in",
        });
      }

      console.error(error);

      throw redirect({
        to: "/error",
      });
    }

    throw redirect({
      to: "/dashboard",
    });
  },
});

export const changeEmailRoute = createRoute({
  path: "/change-email",
  component: () => <ChangeEmailAddressPage />,
  getParentRoute: () => mainLayout,
});

export const confirmEmailRoute = createRoute({
  path: "/confirm-email",
  component: () => <ConfirmEmailPage />,
  getParentRoute: () => mainLayout,
});

export const errorRoute = createRoute({
  path: "/error",
  component: () => "error",
  getParentRoute: () => mainLayout,
});

export const mainRouteTree = mainLayout.addChildren([
  homeRoute,
  changeEmailRoute,
  confirmEmailRoute,
  errorRoute,
]);
