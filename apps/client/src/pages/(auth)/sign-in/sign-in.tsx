import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type z from "zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@saas-starter/shared-validations";
import { api } from "@/api";
import { CustomApiError } from "@/lib/base-api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { CustomButton } from "@/components/custom/custom-button";
import { authLayout } from "@/routes/auth";
import { Link } from "@tanstack/react-router";

const schema = signInSchema;
type Output = z.output<typeof schema>;

export const SignIn = () => {
  const navigate = authLayout.useNavigate();

  const signIn = useMutation({
    mutationFn: (payload: Output) => {
      return api.auth.signIn({
        json: payload,
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
    disabled: signIn.isPending,
    values: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (output: Output) => {
    signIn.mutate(output);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 "
      >
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="example@example.com"
                  type="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password
                <Link
                  to="/request-password-reset"
                  className="ml-auto text-sm text-muted-foreground"
                >
                  Forgot password ?
                </Link>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="********" type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CustomButton type="submit" isPending={signIn.isPending}>
          Sign in
        </CustomButton>

        <div>
          <span className="text-muted-foreground">Don't have an account ?</span>
          <Link className="ml-2" to="/sign-up">
            Sign Up
          </Link>
        </div>
      </form>
    </Form>
  );
};
