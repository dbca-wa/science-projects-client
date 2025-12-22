import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";

const StaffNotFound = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 py-16">
      <p className="text-balance text-center">
        Sorry, that staff member may have left the department or their profile
        is not public.
      </p>
      <Button
        className="mt-8 bg-blue-500 hover:bg-blue-600 text-white"
        onClick={() => {
          window.location.href = "/staff";
        }}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Listings
      </Button>
    </div>
  );
};

export default StaffNotFound;
