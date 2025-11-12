import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
export const OpenEditorDialog = ({
  isOpen,
  proceed,
  reset,
}: {
  isOpen: boolean;
  proceed: () => void;
  reset: () => void;
}) => {
  return (
    <Dialog open={isOpen}>
      {/* <DialogTrigger asChild>
          <Button variant="outline">Edit Profile</Button>
        </DialogTrigger> */}
      <DialogContent
        className="border-none bg-slate-900 sm:max-w-[425px]"
        onClose={reset}
      >
        <DialogHeader className="text-slate-200">
          <DialogTitle>Open Editor</DialogTitle>
          <DialogDescription className="pt-5 text-slate-300">
            You have an open editor on this page! If you navigate away, change
            tabs, dark mode, or the layout any unsaved changes will be lost. Are
            you sure you want to proceed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button onClick={reset} className="bg-slate-800 hover:bg-slate-600">
            Cancel
          </Button>
          <Button onClick={proceed} className="bg-red-800 hover:bg-red-600">
            Proceed and discard changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
