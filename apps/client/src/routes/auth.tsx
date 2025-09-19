import { rootRoute } from "./root";
import { AuthLayout } from "@/pages/(auth)/layout";
import { SignInPage } from "@/pages/(auth)/sign-in/page";
import { SignUpPage } from "@/pages/(auth)/sign-up/page";
import {
  createRoute,
  Outlet,
  redirect,
  isRedirect,
} from "@tanstack/react-router";
import { ResetPasswordPage } from "@/pages/(auth)/reset-password/page";
import { RequestPasswordReset } from "@/pages/(auth)/request-password-reset copy/request-password-reset";
import z from "zod";
import { api } from "@/api";
import { CustomApiError } from "@/lib/base-api";

export const authLayout = createRoute({
  id: "auth-layout",
  getParentRoute: () => rootRoute,
  component: () => (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  ),
  beforeLoad: async () => {
    try {
      await api.auth.getAuthUser();

      throw redirect({
        to: "/dashboard",
      });
    } catch (error) {
      if (error instanceof CustomApiError && error.statusCode === 401) {
        return;
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

export const signInRoute = createRoute({
  getParentRoute: () => authLayout,
  component: () => <SignInPage />,
  path: "/sign-in",
});

export const signUpRoute = createRoute({
  getParentRoute: () => authLayout,
  component: () => <SignUpPage />,
  path: "/sign-up",
});

export const requestPasswordResetRoute = createRoute({
  getParentRoute: () => authLayout,
  component: () => <RequestPasswordReset />,
  path: "/request-password-reset",
});

export const resetPasswordRoute = createRoute({
  getParentRoute: () => authLayout,
  component: () => <ResetPasswordPage />,
  path: "/reset-password",
  validateSearch: z.object({
    token: z.uuid(),
  }),
});

export const authRouteTree = authLayout.addChildren([
  requestPasswordResetRoute,
  resetPasswordRoute,
  signInRoute,
  signUpRoute,
]);
