import { CustomButton } from "@/components/custom/custom-button";
import { Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";

export const ConfirmEmailPage = () => {
  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="flex flex-col text-center w-full max-w-sm">
        <h1 className="text-3xl font-semibold">Email Confirmation Sent!</h1>
        <span className="text-muted-foreground mt-1">
          We've sent a confirmation email to your inbox. Please check your email
          to continue.
        </span>
        <div className="mt-4">
          <CustomButton asChild variant="secondary">
            <Link to={"/"}>
              <ChevronLeftIcon size={16} />
              Go to Home
            </Link>
          </CustomButton>
        </div>
      </div>
    </main>
  );
};
