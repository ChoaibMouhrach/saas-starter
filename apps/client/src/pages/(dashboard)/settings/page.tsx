import { ChangeEmail } from "./change-email";
import { ChangePassword } from "./change-password";

export const Settings = () => {
  return (
    <div className="grid gap-2">
      <ChangeEmail />
      <ChangePassword />
    </div>
  );
};
