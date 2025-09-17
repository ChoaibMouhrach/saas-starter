import { api } from "@/api";
import { CustomButton } from "@/components/custom/custom-button";
import {
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardFooter,
  CustomCardHeader,
  CustomCardTitle,
} from "@/components/custom/custom-card";
import { PasswordInput } from "@/components/custom/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CustomApiError } from "@/lib/base-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@saas-starter/shared-validations";
import { useMutation } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const schema = changePasswordSchema
  .extend({
    newPasswordConfirmation: z.string().min(8).max(60),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    path: ["newPasswordConfirmation"],
    error: "the new password and its confirmation must match",
  });

type Output = z.output<typeof schema>;

export const ChangePassword = () => {
  const changePassword = useMutation({
    mutationFn: (output: Output) => {
      return api.auth.changePassword({
        json: output,
      });
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
      form.reset();
    },
    onError: (err) => {
      if (err instanceof CustomApiError) {
        toast.error(err.code);
        return;
      }

      toast.error("something went wrong");
    },
  });

  const form = useForm({
    resolver: zodResolver(schema),
    disabled: changePassword.isPending,
    values: {
      password: "",
      newPassword: "",
      newPasswordConfirmation: "",
    },
  });

  const onSubmit = (output: Output) => {
    changePassword.mutate(output);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Change password</CustomCardTitle>
            <CustomCardDescription>
              You can change your password by submitting the form bellow
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent className="md:grid-cols-2">
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem className="md:col-start-1 md:col-end-3">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} placeholder="********" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="newPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} placeholder="********" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="newPasswordConfirmation"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password confirmation</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} placeholder="********" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CustomCardContent>
          <CustomCardFooter>
            <CustomButton type="submit" isPending={changePassword.isPending}>
              {changePassword.isPending ? (
                "Saving..."
              ) : (
                <>
                  <SaveIcon /> Save
                </>
              )}
            </CustomButton>
          </CustomCardFooter>
        </CustomCard>
      </form>
    </Form>
  );
};
