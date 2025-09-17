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
import { authLayout } from "@/routes/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { HTTP_ERROR_CODES } from "@saas-starter/shared-constants";
import { signUpSchema } from "@saas-starter/shared-validations";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const schema = signUpSchema
  .extend({
    passwordConfirmation: z.string().min(8).max(60),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    error: "password and password confirmation must match",
  });

type Output = z.output<typeof schema>;

export const SignUp = () => {
  const navigate = authLayout.useNavigate();

  const signUp = useMutation({
    mutationFn: (payload: Output) => {
      return api.auth.signUp({
        json: payload,
      });
    },
    onSuccess: () => {
      navigate({
        to: "/confirm-email",
      });
    },
    onError: (err) => {
      if (err instanceof CustomApiError) {
        toast.error(err.code);
        return;
      }

      toast.error(HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR);
    },
  });

  const form = useForm({
    resolver: zodResolver(schema),
    disabled: signUp.isPending,
    values: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = (payload: Output) => {
    signUp.mutate(payload);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
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

        <CustomButton type="submit" isPending={signUp.isPending}>
          Sign up
        </CustomButton>

        <div>
          <span className="text-muted-foreground">
            Already have an account ?
          </span>
          <Link className="ml-2" to="/sign-in">
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
};
