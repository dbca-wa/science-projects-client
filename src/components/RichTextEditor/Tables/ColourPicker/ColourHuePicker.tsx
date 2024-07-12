import React from "react";
import { MoveWrapper } from "./MoveWrapper";
import { Color, Position } from "@/types";

interface Props {
  selfColor: Color;
  huePosition: {
    x: number;
  };
  WIDTH: number;
  setSelfColor: React.Dispatch<React.SetStateAction<Color>>
  setInputColor: React.Dispatch<React.SetStateAction<string>>;
  transformColor: <M extends keyof Color, C extends Color[M]>(format: M, color: C) => Color;
  setSkipAddingToHistoryStack: React.Dispatch<React.SetStateAction<boolean>>;

}


export const ColourHuePicker = (
  { huePosition, WIDTH, selfColor,
    setSelfColor, setInputColor, transformColor, setSkipAddingToHistoryStack, }: Props) => {


  const onMoveHue = ({ x }: Position) => {
    const newHsv = { ...selfColor.hsv, h: (x / WIDTH) * 360 };
    const newColor = transformColor("hsv", newHsv);

    setSelfColor(newColor);
    setInputColor(newColor.hex);
  };

  return (
    <MoveWrapper
      setSkipAddingToHistoryStack={setSkipAddingToHistoryStack}
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
