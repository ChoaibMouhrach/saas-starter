import { api } from "@/api";
import { toast } from "sonner";
import { MailIcon } from "lucide-react";
import { CustomApiError } from "@/lib/base-api";
import { useMutation } from "@tanstack/react-query";
import { pendingEmailConfirmationRoute } from "@/routes/main";
import { CustomButton } from "@/components/custom/custom-button";

export const PendingEmailConfirmationPage = () => {
  const auth = pendingEmailConfirmationRoute.useRouteContext();

  const resendConfirmationEmail = useMutation({
    mutationFn: () => {
      return api.auth.resendConfirmationEmail();
    },
    onSuccess: () => {
      toast.success(
        ` We've sent a confirmation email to ${auth.user.email}. Please check your inbox and click the confirmation link to activate your account.`
      );
    },
    onError: (err) => {
      if (err instanceof CustomApiError) {
        toast.error(err.code);
        return;
      }

      toast.error("something-went-wrong");
    },
  });

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="flex flex-col text-center w-full max-w-sm">
        <h1 className="text-3xl font-semibold">Confirm your email address</h1>
        <span className="text-muted-foreground mt-1">
          We've sent a confirmation email to {auth.user.email}. Please check
          your inbox and click the confirmation link to activate your account.
        </span>
        <div className="mt-4">
          <CustomButton
            variant="secondary"
            onClick={() => resendConfirmationEmail.mutate()}
            isPending={resendConfirmationEmail.isPending}
          >
            {!resendConfirmationEmail.isPending && <MailIcon />}{" "}
            {resendConfirmationEmail.isPending
              ? "Sending..."
              : "Resend confirmation email"}
          </CustomButton>
        </div>
      </div>
    </main>
  );
};
