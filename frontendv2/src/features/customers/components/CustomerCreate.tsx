import { Input } from "@/components/ui/input";
import type { Customer } from "../types/customer";
import { useForm, useStore } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export const CustomerCreate = () => {
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: async (body: Omit<Customer, "id">) => {
      fetchWithAuth(`/api/customers`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      toast.success("Succesfully created customer");
      navigate(-1);
    },
    onError: (error) => {
      toast.error(JSON.stringify(error));
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
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
        <Button type="submit" disabled={isDefaultValue}>
          Submit
        </Button>
      </form>
    </div>
  );
};
