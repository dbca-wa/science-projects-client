import PatchNotes from "@/features/dashboard/components/PatchNotes";
import { useUser } from "@/features/users/hooks/useUser";

const PatchNotesPage = () => {
  const { userData } = useUser();

  return <PatchNotes />;
};

export default PatchNotesPage;
