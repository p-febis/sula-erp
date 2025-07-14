import { useNavigate } from "react-router";
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
import { Button } from "./ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { useDeleteResource } from "@/hooks/use-delete-resource";

export const DeleteButton = ({
  resource,
  id,
}: {
  resource: string;
  id: string;
}) => {
  const navigate = useNavigate();

  const { delete$ } = useDeleteResource(resource, id, (data, error) => {
    if (data) {
      toast.success("Succesfully deleted customer");
      navigate(-1);
    }

    if (error) {
      toast.error(error.message);
    }
  });

  const handleSubmit = () => {
    delete$();
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
