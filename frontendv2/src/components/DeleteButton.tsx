import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";
import { Button } from "./ui/button";
import { DialogClose } from "@radix-ui/react-dialog";

export const DeleteButton = ({
  resource,
  id,
}: {
  resource: string;
  id: string;
}) => {
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: async () => {
      fetchWithAuth(`/api/${resource}/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Succesfully deleted customer");
      navigate(-1);
    },
    onError: (error) => {
      toast.error(JSON.stringify(error));
    },
  });

  const handleSubmit = () => {
    mutate();
  };

  return (
    <Dialog>
      <Button asChild variant="destructive">
        <DialogTrigger>Delete</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            You are about to delete resource, this action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="destructive" onClick={handleSubmit}>
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
