import { Input } from "@/components/ui/input";
import type { Customer } from "../types/customer";
import { useForm, useStore } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { DeleteButton } from "@/components/DeleteButton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateCustomer } from "../hooks/use-update-customer";

export const CustomerEdit = ({ customer }: { customer: Customer }) => {
  const { id, ...restCustomer } = customer;

  const navigate = useNavigate();

  const { update } = useUpdateCustomer(id, (data, error) => {
    if (data) {
      toast.success("Succesfully updated customer");
      navigate(-1);
    }

    if (error) {
      toast.error(JSON.stringify(error));
    }
  });

  const form = useForm({
    defaultValues: restCustomer,
    onSubmit: async ({ value }) => {
      update(value);
    },
  });

  const isDefaultValue = useStore(form.store, (state) => state.isDefaultValue);

  return (
    <div className="p-4 flex items-center justify-center h-full">
      <Card>
        <CardHeader>
          <CardTitle>Create a customer</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="w-sm md:min-w-md space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="name"
              children={(field) => (
                <>
                  <label htmlFor={field.name}>Name:</label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </>
              )}
            />
            <form.Field
              name="email"
              children={(field) => (
                <>
                  <label htmlFor={field.name}>Email:</label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </>
              )}
            />
            <form.Field
              name="phone"
              children={(field) => (
                <>
                  <label htmlFor={field.name}>Phone number:</label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </>
              )}
            />
            <div className="w-full inline-flex justify-between">
              <Button type="submit" disabled={isDefaultValue}>
                Submit
              </Button>
              <DeleteButton resource="customers" id={String(id)} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
