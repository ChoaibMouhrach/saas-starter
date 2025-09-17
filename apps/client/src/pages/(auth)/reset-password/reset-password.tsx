import { api } from "@/api";
import { CustomButton } from "@/components/custom/custom-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomApiError } from "@/lib/base-api";
import { resetPasswordRoute } from "@/routes/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@saas-starter/shared-validations";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const schema = resetPasswordSchema
  .extend({
    passwordConfirmation: z.string().min(8).max(60),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    error: "password and password confirmation must match",
  });

type Output = z.output<typeof resetPasswordSchema>;

export const ResetPassword = () => {
  const search = resetPasswordRoute.useSearch();
  const navigate = useNavigate();

  const resetPassword = useMutation({
    mutationFn: (payload: Output) => {
      return api.auth.resetPassword({
        json: payload,
        query: search,
      });
    },
    onSuccess: () => {
      navigate({
        to: "/",
      });
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
    disabled: resetPassword.isPending,
    values: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = (output: Output) => {
    resetPassword.mutate(output);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 "
      >
        <Link to="/sign-in" className="flex items-center text-sm gap-1">
          <ChevronLeftIcon size={16} /> Back
        </Link>
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} placeholder="********" type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="passwordConfirmation"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password confirmation</FormLabel>
              <FormControl>
                <Input {...field} placeholder="********" type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CustomButton type="submit" isPending={resetPassword.isPending}>
          Reset password
        </CustomButton>
      </form>
    </Form>
  );
};
