import { LoaderCircle } from "lucide-react";

export const Spinner = () => {
  return (
    <div className="p-4 flex items-center justify-center h-full">
      <div>
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    </div>
  );
};
