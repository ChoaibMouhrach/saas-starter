import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronsUpDownIcon,
  DoorOpenIcon,
  Laptop2Icon,
  Loader2Icon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react";
import { CustomButton } from "@/components/custom/custom-button";
import { dashboardLayout } from "@/routes/dashboard";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { CustomApiError } from "@/lib/base-api";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme } from "@/components/custom/theme-provider";

export const Profile = () => {
  const { user } = dashboardLayout.useRouteContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CustomButton
          variant="outline"
          className="flex items-center justify-normal"
        >
          <span>{user.email}</span>
          <ChevronsUpDownIcon
            size={16}
            className="ml-auto text-muted-foreground"
          />
        </CustomButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="DropdownMenuContent">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/settings">
            <SettingsIcon size={16} /> Settings
          </Link>
        </DropdownMenuItem>

        <SignOut />

        <DropdownMenuSeparator />

        <SwitchTheme />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SignOut = () => {
  const navigate = useNavigate();

  const signOut = useMutation({
    mutationFn: () => api.auth.signOut(),
    onSuccess: () => navigate({ to: "/sign-in" }),
    onError: (err) => {
      if (err instanceof CustomApiError) {
        toast.error(err.code);
        return;
      }

      toast.error("something went wrong");
    },
  });

  const onSignOut = () => signOut.mutate();

  return (
    <DropdownMenuItem onClick={onSignOut}>
      {signOut.isPending ? (
        <Loader2Icon className="animate-spin" size={16} />
      ) : (
        <DoorOpenIcon size={16} />
      )}{" "}
      Sign out
    </DropdownMenuItem>
  );
};

const SwitchTheme = () => {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup
      type="single"
      className="w-auto"
      size="sm"
      variant="outline"
      value={theme}
      onValueChange={setTheme}
    >
      <ToggleGroupItem value="light">
        <SunIcon size={16} />
      </ToggleGroupItem>
      <ToggleGroupItem value="system">
        <Laptop2Icon size={16} />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark">
        <MoonIcon size={16} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
