import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

type ButtonProps = Parameters<typeof Button>[0];

interface CustomButtonProps extends ButtonProps {
  isPending?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  isPending,
  disabled,
  children,
  type,
  className,
  ...rest
}) => {
  return (
    <Button
      {...rest}
      className={cn("cursor-pointer", className)}
      disabled={isPending || disabled}
      type={type || "button"}
    >
      {isPending ? (
        <>
          <Loader2 className="animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
