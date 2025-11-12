import PatchNotes from "@/shared/components/Pages/Dashboard/PatchNotes";
import { useUser } from "@/shared/hooks/tanstack/useUser";

const PatchNotesPage = () => {
  const { userData } = useUser();

  return <PatchNotes />;
};

export default PatchNotesPage;
