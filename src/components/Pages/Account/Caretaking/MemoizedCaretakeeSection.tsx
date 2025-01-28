import { IUserMe } from "@/types";
import { CaretakeeDataTable } from "./CaretakeeDataTable";
import React from "react";
import isEqual from "lodash.isequal";

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
    // Use lodash's isEqual for deep comparison of caretaking_for
    return isEqual(
      prevProps.userData?.caretaking_for,
      nextProps.userData?.caretaking_for,
    );
  },
);
