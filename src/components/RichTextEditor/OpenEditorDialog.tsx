import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
            An editor is open! Make sure you have saved any changes you made.
            Are you sure you want to leave?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button onClick={reset} className="bg-slate-800 hover:bg-slate-600">
            Cancel
          </Button>
          <Button onClick={proceed} className="bg-red-800 hover:bg-red-600">
            Leave Page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
