import { Input } from "@/components/ui/input";
import { useForm, useStore } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useCreateCustomer } from "../hooks/use-create-customer";

export const CustomerCreate = () => {
  const navigate = useNavigate();

  const { create } = useCreateCustomer((data, error) => {
    if (data) {
      toast.success(`Succesfully created customer '${data.name}'`);
      navigate(-1);
    }

    if (error) {
      toast.error(error.message);
    }
  });

  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
    onSubmit: async ({ value }) => {
      create(value);
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
