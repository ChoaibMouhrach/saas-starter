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
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordResetSchema } from "@saas-starter/shared-validations";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";

const schema = requestPasswordResetSchema;
type Output = z.output<typeof schema>;

export const RequestPasswordReset = () => {
  const requestPasswordReset = useMutation({
    mutationFn: (payload: Output) => {
      return api.auth.requestPasswordReset({
        json: payload,
      });
    },
    onSuccess: () => {
      toast.success("check your email");

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
    disabled: requestPasswordReset.isPending,
    values: {
      email: "",
    },
  });

  const onSubmit = (output: Output) => {
    requestPasswordReset.mutate(output);
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

        <CustomButton type="submit" isPending={requestPasswordReset.isPending}>
          Reset password
        </CustomButton>
      </form>
    </Form>
  );
};
