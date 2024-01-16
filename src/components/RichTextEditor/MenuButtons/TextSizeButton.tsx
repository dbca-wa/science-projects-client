// Adjust the text size in the rich text editor

import { BaseToolbarMenuButton } from "../Buttons/BaseToolbarMenuButton";
import { useState } from "react";

// A Button for adjusting text size in px with a dropdown

export const TextSizeButton = () => {
  const [currentSize, setCurrentSize] = useState<string>("15px");

  const Text10 = () => {
    console.log("Text 10px");
    setCurrentSize("10px");
  };

  const Text11 = () => {
    console.log("Text 11px");
    setCurrentSize("11px");
  };

  const Text12 = () => {
    console.log("Text 12px");
    setCurrentSize("12px");
  };

  const Text13 = () => {
    console.log("Text 13px");
    setCurrentSize("13px");
  };

  const Text14 = () => {
    console.log("Text 14px");
    setCurrentSize("14px");
  };

  const Text15 = () => {
    console.log("Text 15px");
    setCurrentSize("15px");
  };

  const Text16 = () => {
    console.log("Text 16px");
    setCurrentSize("16px");
  };

  const Text17 = () => {
    console.log("Text 17px");
    setCurrentSize("17px");
  };

  const Text18 = () => {
    console.log("Text 18px");
    setCurrentSize("18px");
  };

  const Text19 = () => {
    console.log("Text 19px");
    setCurrentSize("19px");
  };

  const Text20 = () => {
    console.log("Text 20px");
    setCurrentSize("20px");
  };

  return (
    <BaseToolbarMenuButton
      title={currentSize}
      menuItems={[
        {
          text: "10px",
          onClick: Text10,
        },
        {
          text: "11px",
          onClick: Text11,
        },
        {
          text: "12px",
          onClick: Text12,
        },
        {
          text: "13px",
          onClick: Text13,
        },
        {
          text: "14px",
          onClick: Text14,
        },
        {
          text: "15px",
          onClick: Text15,
        },
        {
          text: "16px",
          onClick: Text16,
        },
        {
          text: "17px",
          onClick: Text17,
        },
        {
          text: "18px",
          onClick: Text18,
        },
        {
          text: "19px",
          onClick: Text19,
        },
        {
          text: "20px",
          onClick: Text20,
        },
        {
          text: "17px",
          onClick: Text17,
        },
        {
          text: "18px",
          onClick: Text18,
        },
        {
          text: "19px",
          onClick: Text19,
        },
      ]}
    />
  );
};
