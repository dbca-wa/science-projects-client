import React from "react";
import { MoveWrapper } from "./MoveWrapper";
import { Color, Position } from "@/types";

interface Props {
  selfColor: Color;
  saturationPosition: Position;
  WIDTH: number;
  HEIGHT: number;
  setSelfColor: React.Dispatch<React.SetStateAction<Color>>
  setInputColor: React.Dispatch<React.SetStateAction<string>>;
  transformColor: <M extends keyof Color, C extends Color[M]>(format: M, color: C) => Color;
  setSkipAddingToHistoryStack: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ColourSaturationPicker = ({
  saturationPosition,
  WIDTH, HEIGHT,
  selfColor,
  setSelfColor, setInputColor, transformColor, setSkipAddingToHistoryStack,
}: Props) => {

  const onMoveSaturation = ({ x, y }: Position) => {

    // Ensure x and y are within bounds
    x = Math.max(0, Math.min(x, WIDTH));
    y = Math.max(0, Math.min(y, HEIGHT));

    const newHsv = {
      ...selfColor.hsv,
      s: (x / WIDTH) * 100,
      v: 100 - (y / HEIGHT) * 100,
    };
    const newColor = transformColor("hsv", newHsv);
    setSelfColor(newColor);
    setInputColor(newColor.hex);
  };
  const height = `${String(HEIGHT)}px`
  return (
    <MoveWrapper
      className={`relative mt-[15px] h-[${height}] w-full select-none`}
      style={{
        backgroundColor: `hsl(${selfColor.hsv.h}, 100%, 50%)`,
        backgroundImage: `linear-gradient(transparent, black),
     linear-gradient(to right, white, transparent)`,
      }}
      onChange={onMoveSaturation}
      setSkipAddingToHistoryStack={setSkipAddingToHistoryStack}
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
