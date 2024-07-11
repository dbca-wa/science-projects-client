import React from "react";
import { MoveWrapper } from "./MoveWrapper";

export const ColourHuePicker = () => {
  return (
    <MoveWrapper
      className="relative mt-[15px] h-[12px] w-full select-none rounded-[12px]"
      style={{
        backgroundImage: `linear-gradient(
            to right,
            rgb(255, 0, 0),
            rgb(255, 255, 0),
            rgb(0, 255, 0),
            rgb(0, 255, 255),
            rgb(0, 0, 255),
            rgb(255, 0, 255),
            rgb(255, 0, 0)
        )`,
      }}
      onChange={onMoveHue}
    >
      {/* Colour Picker Hue Cursor */}
      <div
        className="absolute size-[20px] rounded-[50%] border-[2px] border-[#fff]"
        style={{
          backgroundColor: `hsl(${selfColor.hsv.h}, 100%, 50%)`,
          left: huePosition.x,
          boxShadow: "0003 0 0 0 0.5px",
          transform: "translate(-10px, -4px)",
        }}
      />
    </MoveWrapper>
  );
};
