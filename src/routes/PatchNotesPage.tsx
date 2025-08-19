import { PatchNotes } from "@/components/Pages/Dashboard/PatchNotes";
import { useUser } from "@/lib/hooks/tanstack/useUser";

const PatchNotesPage = () => {
  const { userData } = useUser();

  return (
    <div>
      {" "}
      <PatchNotes userData={userData} />
    </div>
  );
};

export default PatchNotesPage;
