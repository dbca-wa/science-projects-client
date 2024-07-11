import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ColourHexInput } from "./ColourHexInput";
import { useColourPickerHelpers } from "@/lib/hooks/helper/useColourPickerHelpers";
import { ColourSelectedDisplay } from "./ColourSelectedDisplay";

interface ColorPickerProps {
  color: string;
  onChange?: (value: string, skipHistoryStack: boolean) => void;
  w: number;
  h: number;
}

export default function ColorPicker({
  color,
  onChange,
  w,
  h,
}: Readonly<ColorPickerProps>): JSX.Element {
  // const saturationPosition = useMemo(
  //   () => ({
  //     x: (selfColor.hsv.s / 100) * WIDTH,
  //     y: ((100 - selfColor.hsv.v) / 100) * HEIGHT,
  //   }),
  //   [selfColor.hsv.s, selfColor.hsv.v, WIDTH, HEIGHT],
  // );

  // const huePosition = useMemo(
  //   () => ({
  //     x: (selfColor.hsv.h / 360) * WIDTH,
  //   }),
  //   [selfColor.hsv, WIDTH],
  // );

  // const onMoveSaturation = ({ x, y }: Position) => {
  //   const newHsv = {
  //     ...selfColor.hsv,
  //     s: (x / WIDTH) * 100,
  //     v: 100 - (y / HEIGHT) * 100,
  //   };
  //   const newColor = transformColor("hsv", newHsv);
  //   setSelfColor(newColor);
  //   setInputColor(newColor.hex);
  // };

  // const onMoveHue = ({ x }: Position) => {
  //   const newHsv = { ...selfColor.hsv, h: (x / WIDTH) * 360 };
  //   const newColor = transformColor("hsv", newHsv);

  //   setSelfColor(newColor);
  //   setInputColor(newColor.hex);
  // };

  // Init
  const { transformColor } = useColourPickerHelpers();

  const WIDTH = w;
  const HEIGHT = h;
  const [selfColor, setSelfColor] = useState(transformColor("hex", color));
  const [inputColor, setInputColor] = useState(color);

  const [skipAddingToHistoryStack, setSkipAddingToHistoryStack] =
    useState(false);
  const innerDivRef = useRef(null);

  const onSetHex = (hex: string) => {
    setInputColor(hex);
    if (/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
      const newColor = transformColor("hex", hex);
      setSelfColor(newColor);
    }
  };

  useEffect(() => {
    // Check if the dropdown is actually active
    if (innerDivRef.current !== null && onChange) {
      onChange(selfColor.hex, skipAddingToHistoryStack);
      setInputColor(selfColor.hex);
    }
  }, [selfColor, onChange]);

  useEffect(() => {
    if (color === undefined) {
      return;
    }
    const newColor = transformColor("hex", color);
    setSelfColor(newColor);
    setInputColor(newColor.hex);
  }, [color]);

  return (
    // Color Picker Wrapper
    <div className={`w-[${WIDTH}px] p-[0px] py-[20px]`} ref={innerDivRef}>
      <ColourSelectedDisplay selfColor={selfColor} />
      <ColourHexInput onChange={onSetHex} value={inputColor} />
      {/* <ColourPalettePicker />
      <ColourSaturationPicker />
      <ColourHuePicker />
      */}
    </div>
  );
}
