import { useBreakpointValue } from "@/shared/utils/theme.utils";

export const SideMenuSectionDivider = () => {
  const isOver750 = useBreakpointValue({
    base: true,
    sm: false,
    md: false,
    lg: true,
  });
  return (
    <div
      className={`w-full p-2 mb-4 relative ${isOver750 ? "ml-4" : ""}`}
    >
      <hr />
    </div>
  );
};
