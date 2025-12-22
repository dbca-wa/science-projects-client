// Wrapper for the Page view on Account page.

import { ReactNode } from "react";

interface IPageViewProps {
  children: ReactNode;
}

export const AccountPageViewWrapper = ({ children }: IPageViewProps) => {
  return (
    <div className="min-h-[90vh] h-full w-full flex flex-col flex-1 overflow-x-hidden flex-shrink-0">
      <div className="overflow-y-auto flex-1 p-3 overflow-x-hidden w-full">
        {children}
      </div>
    </div>
  );
};
