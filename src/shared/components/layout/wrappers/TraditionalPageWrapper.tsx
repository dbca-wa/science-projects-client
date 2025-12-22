// A subcomponent only used in the TraditionalLayout for setting padding etc.

import { FC, ReactNode } from "react";

interface IPageWrapperProps {
  children: ReactNode;
}

export const TraditionalPageWrapper: FC<IPageWrapperProps> = ({
  children,
}) => {
  return (
    <div
      className="mx-4 sm:mx-6 md:mx-[10%] lg:mx-[15%] py-2 flex-1 flex flex-col overscroll-none min-h-screen"
    >
      {children}
    </div>
  );
};
