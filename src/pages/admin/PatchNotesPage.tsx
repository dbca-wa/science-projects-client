import PatchNotes from "@/components/Pages/Dashboard/PatchNotes";
import { useUser } from "@/lib/hooks/tanstack/useUser";

const PatchNotesPage = () => {
  const { userData } = useUser();

  return <PatchNotes />;
};

export default PatchNotesPage;
