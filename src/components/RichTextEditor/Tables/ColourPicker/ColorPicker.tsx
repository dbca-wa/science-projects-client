import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ColourHexInput } from "./ColourHexInput";
import { useColourPickerHelpers } from "@/lib/hooks/helper/useColourPickerHelpers";
import { ColourSelectedDisplay } from "./ColourSelectedDisplay";
import { ColourPalettePicker } from "./ColourPalettePicker";
import { ColourSaturationPicker } from "./ColourSaturationPicker";
import { ColourHuePicker } from "./ColourHuePicker";
import { TableCellNode } from "@lexical/table"
import { LexicalEditor } from "lexical";


interface ColorPickerProps {
  color: string;
  onChange?: (value: string, skipHistoryStack: boolean) => void;
  w: number;
  h: number;
  editor: LexicalEditor;
  tableCellNode: TableCellNode;
  updateTableCellNode: React.Dispatch<React.SetStateAction<TableCellNode>>;
  currentCellBackgroundColor: (editor: LexicalEditor) => null | string;
  setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
}

export default function ColorPicker({
  color,
  onChange,
  w,
  h,
  editor, tableCellNode, updateTableCellNode,
  currentCellBackgroundColor,
  setBackgroundColor
}: Readonly<ColorPickerProps>): JSX.Element {
  // Init
  const WIDTH = w;
  const HEIGHT = h;
  const { transformColor } = useColourPickerHelpers();
  const [selfColor, setSelfColor] = useState(transformColor("hex", color));
  const [inputColor, setInputColor] = useState(color);

  const saturationPosition = useMemo(
    () => ({
      x: (selfColor.hsv.s / 100) * WIDTH,
      y: ((100 - selfColor.hsv.v) / 100) * HEIGHT,
    }),
    [selfColor.hsv.s, selfColor.hsv.v, WIDTH, HEIGHT],
  );

  const huePosition = useMemo(
    () => ({
      x: (selfColor.hsv.h / 360) * WIDTH,
    }),
    [selfColor.hsv, WIDTH],
  );

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

  useEffect(() => {
    return editor.registerMutationListener(TableCellNode, (nodeMutations) => {
      const nodeUpdated =
        nodeMutations.get(tableCellNode.getKey()) === "updated";

      if (nodeUpdated) {
        console.log("updated!")
        editor.getEditorState().read(() => {
          updateTableCellNode(tableCellNode.getLatest());
        });
        setBackgroundColor(currentCellBackgroundColor(editor) || "red");
      }
    });
  }, [editor, tableCellNode]);

  return (
    // Color Picker Wrapper
    <div className={`w-[${WIDTH}px] p-[0px] py-[20px]`} ref={innerDivRef}>
      <ColourSelectedDisplay selfColor={selfColor} />
      <ColourHexInput onChange={onSetHex} value={inputColor} />
      <ColourPalettePicker
        selfColor={selfColor}
        setSelfColor={setSelfColor}
        setInputColor={setInputColor}
        transformColor={transformColor}
      />
      <ColourSaturationPicker
        saturationPosition={saturationPosition}
        WIDTH={WIDTH}
        HEIGHT={HEIGHT}
        selfColor={selfColor}
        setSelfColor={setSelfColor}
        setInputColor={setInputColor}
        transformColor={transformColor}
        setSkipAddingToHistoryStack={setSkipAddingToHistoryStack}
      />
      <ColourHuePicker
        WIDTH={WIDTH}
        huePosition={huePosition}
        selfColor={selfColor}
        setSelfColor={setSelfColor}
        setInputColor={setInputColor}
        transformColor={transformColor}
        setSkipAddingToHistoryStack={setSkipAddingToHistoryStack}
      />
    </div>
  );
}
