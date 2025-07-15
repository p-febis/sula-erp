import { Input } from "@/components/ui/input";
import { useForm, useStore } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { useCreateRole } from "../hooks/use-create-role";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const RoleCreate = () => {
  const navigate = useNavigate();

  const { create } = useCreateRole((data, error) => {
    if (data) {
      toast.success(`Succesfully created role '${data.name}'`);
      navigate(-1);
    }

    if (error) {
      toast.error(error.message);
    }
  });

  const form = useForm({
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value }) => {
      create(value);
    },
  });

  const isDefaultValue = useStore(form.store, (state) => state.isDefaultValue);

  return (
    <div className="p-4 flex items-center justify-center h-full">
      <Card>
        <CardHeader>
          <CardTitle>Create role</CardTitle>
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
            <Button type="submit" disabled={isDefaultValue}>
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
