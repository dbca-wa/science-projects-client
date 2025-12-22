// Route for how-to for website

import { Head } from "@/shared/components/layout/base/Head";
import { HowToSidebar } from "@/features/dashboard/components/howto/HowToSidebar";
import { HowToView } from "@/features/dashboard/components/howto/HowToView";

export const HowTo = () => {
  return (
    <>
      <Head title="How To" />

      <div className="flex my-4 h-full">
        <HowToView />
        <HowToSidebar />
      </div>
    </>
  );
};
