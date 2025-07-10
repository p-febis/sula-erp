import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { useLogin } from "../hooks/use-login";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export const LoginPage = () => {

  const navigate = useNavigate();

  const { login } = useLogin((data, error) => {
    if (data) {
      const { accessToken } = data;
      sessionStorage.setItem("accessToken", accessToken);
      navigate("/dashboard");
    }

    if (error) {
      toast.error(JSON.stringify(error));
    }
  });

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      login(value);
    },
  });

  return (
    <div className="p-4 flex items-center justify-center h-svh">
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
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
              name="username"
              children={(field) => (
                <>
                  <label htmlFor={field.name}>Username:</label>
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
              name="password"
              children={(field) => (
                <>
                  <label htmlFor={field.name}>Password:</label>
                  <Input
                    type="password"
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
              <Button type="submit"> Login </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
