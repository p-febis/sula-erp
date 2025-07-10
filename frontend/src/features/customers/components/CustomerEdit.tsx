import { Input } from "@/components/ui/input";
import type { Customer } from "../types/customer";
import { useForm, useStore } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { DeleteButton } from "@/components/DeleteButton";

export const CustomerEdit = ({ customer }: { customer: Customer }) => {
  const { id, ...restCustomer } = customer;

  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: async (body: Omit<Customer, "id">) => {
      fetchWithAuth(`/api/customers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      toast.success("Succesfully updated customer");
      navigate(-1);
    },
    onError: (error) => {
      toast.error(JSON.stringify(error));
    },
  });

  const form = useForm({
    defaultValues: restCustomer,
    onSubmit: async ({ value }) => {
      mutate(value);
    },
  });

  const isDefaultValue = useStore(form.store, (state) => state.isDefaultValue);

  return (
    <div className="p-4 flex items-center justify-center h-full">
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
    </div>
  );
};
