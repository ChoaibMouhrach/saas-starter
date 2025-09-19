import { createRoute, isRedirect, redirect } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { HomePage } from "@/pages/home/page";
import { api } from "@/api";
import { CustomApiError } from "@/lib/base-api";
import { ChangeEmailAddressPage } from "@/pages/(public)/change-email-address/page";
import { ConfirmEmailPage } from "@/pages/(public)/confirm-email/page";
import z from "zod";
import { ErrorPage } from "@/pages/(public)/error/page";
import { PendingEmailConfirmationPage } from "@/pages/(auth)/pending-email-confirmation/page";

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
  component: () => <ErrorPage />,
  getParentRoute: () => mainLayout,
  validateSearch: z.object({
    error: z.string().default("something went wrong"),
  }),
});

export const pendingEmailConfirmationRoute = createRoute({
  getParentRoute: () => mainLayout,
  path: "/pending-email-confirmation",
  component: () => <PendingEmailConfirmationPage />,
  beforeLoad: async () => {
    try {
      const auth = await api.auth.getAuthUser();

      if (auth.user.confirmedAt) {
        throw redirect({
          to: "/sign-in",
        });
      }

      return auth;
    } catch (err) {
      if (err instanceof CustomApiError) {
        if (err.statusCode === 401) {
          throw redirect({ to: "/sign-in" });
        }

        throw redirect({
          to: "/error",
          search: {
            error: err.code,
          },
        });
      }

      if (isRedirect(err)) {
        throw err;
      }

      throw redirect({ to: "/error" });
    }
  },
});

export const mainRouteTree = mainLayout.addChildren([
  homeRoute,
  changeEmailRoute,
  confirmEmailRoute,
  errorRoute,
  pendingEmailConfirmationRoute,
]);
