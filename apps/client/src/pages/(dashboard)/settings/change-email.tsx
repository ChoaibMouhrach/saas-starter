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
import { dashboardLayout } from "@/routes/dashboard";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeEmailSchema } from "@saas-starter/shared-validations";
import { useMutation } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const schema = changeEmailSchema;
type Output = z.output<typeof schema>;

export const ChangeEmail = () => {
  const { user } = dashboardLayout.useRouteContext();

  const changeEmail = useMutation({
    mutationFn: (output: Output) => {
      return api.auth.requestEmailChange({
        json: output,
      });
    },
    onSuccess: () => {
      toast.success(
        "Check the inbox of your new email address for our verification link"
      );
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
    disabled: changeEmail.isPending,
    values: {
      email: user.email,
    },
  });

  const onSubmit = (output: Output) => {
    changeEmail.mutate(output);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Change email address</CustomCardTitle>
            <CustomCardDescription>
              You can change your email address by submitting the form bellow
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent className="grid-cols-2">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-start-1 col-end-3">
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CustomCardContent>
          <CustomCardFooter>
            <CustomButton type="submit" isPending={changeEmail.isPending}>
              {changeEmail.isPending ? (
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
