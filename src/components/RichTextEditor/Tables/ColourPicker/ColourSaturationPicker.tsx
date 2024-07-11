import React from "react";
import { MoveWrapper } from "./MoveWrapper";

export const ColourSaturationPicker = () => {
  return (
    <MoveWrapper
      className="relative mt-[15px] h-[150px] w-full select-none"
      style={{
        backgroundColor: `hsl(${selfColor.hsv.h}, 100%, 50%)`,
        backgroundImage: `linear-gradient(transparent, black),
     linear-gradient(to right, white, transparent)`,
      }}
      onChange={onMoveSaturation}
    >
      {/* Colour Picker Sat Cursor */}
      <div
        className="absolute box-border size-[20px] rounded-[50%] border-[2px] border-white"
        style={{
          backgroundColor: selfColor.hex,
          left: saturationPosition.x,
          top: saturationPosition.y,
          boxShadow: "0 0 15px #00000026",
          transform: "translate(-10px, -10px)",
        }}
      />
    </MoveWrapper>
  );
};
