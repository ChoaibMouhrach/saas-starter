import { CustomButton } from "@/components/custom/custom-button";
import { Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";

export const ChangeEmailAddressPage = () => {
  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="flex flex-col text-center w-full max-w-md">
        <h1 className="text-3xl font-semibold">Email Successfully Changed</h1>
        <span className="text-muted-foreground mt-1">
          Your email address has been updated to your new email. You can now use
          it to sign in to your account.
        </span>
        <div className="mt-4">
          <CustomButton asChild variant="secondary">
            <Link to={"/"}>
              <ChevronLeftIcon size={16} />
              Get to Home
            </Link>
          </CustomButton>
        </div>
      </div>
    </main>
  );
};
