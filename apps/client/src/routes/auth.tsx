import { rootRoute } from "./root";
import { AuthLayout } from "@/pages/(auth)/layout";
import { SignInPage } from "@/pages/(auth)/sign-in/page";
import { SignUpPage } from "@/pages/(auth)/sign-up/page";
import { ProfilePage } from "@/pages/(auth)/profile/page";
import { createRoute, Outlet } from "@tanstack/react-router";
import { ConfirmEmailPage } from "@/pages/(auth)/confirm-email/page";
import { ResetPasswordPage } from "@/pages/(auth)/reset-password/page";
import { RequestPasswordReset } from "@/pages/(auth)/request-password-reset copy/request-password-reset";
import z from "zod";

export const authLayout = createRoute({
  component: () => (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  ),
  getParentRoute: () => rootRoute,
  id: "auth-layout",
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

export const confirmEmailRoute = createRoute({
  getParentRoute: () => authLayout,
  component: () => <ConfirmEmailPage />,
  path: "/confirm-email",
});

export const profileRoute = createRoute({
  getParentRoute: () => authLayout,
  component: () => <ProfilePage />,
  path: "/profile",
});

export const authRouteTree = authLayout.addChildren([
  requestPasswordResetRoute,
  resetPasswordRoute,
  confirmEmailRoute,
  profileRoute,
  signInRoute,
  signUpRoute,
]);
