import { IUserMe } from "@/types";
import { CaretakeeDataTable } from "./CaretakeeDataTable";
import React from "react";

export const MemoizedCaretakeeSection = React.memo(
  ({
    userData,
    refetchCaretakerData,
  }: {
    userData: IUserMe;
    refetchCaretakerData: () => void;
  }) => {
    // Only render if we have caretaking_for data
    if (!userData?.caretaking_for?.length) return null;

    return (
      <CaretakeeDataTable
        myData={userData}
        refetchCaretakerData={refetchCaretakerData}
      />
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if caretaking_for data has changed
    return (
      JSON.stringify(prevProps.userData?.caretaking_for) ===
      JSON.stringify(nextProps.userData?.caretaking_for)
    );
  },
);
