// A subcomponent only used in ModernLayout for setting the base padding for the ModernLayout

import { FC, ReactNode } from "react";

interface IPageWrapperProps {
  children: ReactNode;
}

export const ModernPageWrapper: FC<IPageWrapperProps> = ({
  children,
}) => {
  return (
    <div className="h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="flex flex-1 flex-col max-h-screen h-full">
        <div className="pb-4 h-full">
          {children}
        </div>
      </div>
    </div>
  );
};
