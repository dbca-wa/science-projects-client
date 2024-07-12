import { useRef } from "react";
import { calculateZoomLevel } from "@lexical/utils";
import { useColourPickerHelpers } from "@/lib/hooks/helper/useColourPickerHelpers";
import { Position } from "@/types";

interface MoveWrapperProps {
  className?: string;
  style?: React.CSSProperties;
  onChange: (position: Position) => void;
  children: JSX.Element;
  skipAddingToHistoryStack?: boolean;
  setSkipAddingToHistoryStack?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MoveWrapper = ({
  className,
  style,
  onChange,
  children,
  skipAddingToHistoryStack,
  setSkipAddingToHistoryStack,
}: MoveWrapperProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const { clamp } = useColourPickerHelpers();

  const move = (e: React.MouseEvent | MouseEvent): void => {
    if (divRef.current) {
      const { current: div } = divRef;
      const { width, height, left, top } = div.getBoundingClientRect();
      const zoom = calculateZoomLevel(div);
      const x = clamp(e.clientX / zoom - left, width, 0);
      const y = clamp(e.clientY / zoom - top, height, 0);

      onChange({ x, y });
    }
  };

  const onMouseDown = (e: React.MouseEvent): void => {
    if (e.button !== 0) {
      return;
    }

    move(e);

    const onMouseMove = (_e: MouseEvent): void => {
      draggedRef.current = true;
      if (skipAddingToHistoryStack !== true) {
        setSkipAddingToHistoryStack(true);
      }
      move(_e);
    };

    const onMouseUp = (_e: MouseEvent): void => {
      if (draggedRef.current) {
        if (skipAddingToHistoryStack !== false) {
          setSkipAddingToHistoryStack(false);
        }
      }

      document.removeEventListener("mousemove", onMouseMove, false);
      document.removeEventListener("mouseup", onMouseUp, false);

      move(_e);
      draggedRef.current = false;
    };

    document.addEventListener("mousemove", onMouseMove, false);
    document.addEventListener("mouseup", onMouseUp, false);
  };

  return (
    <div
      ref={divRef}
      className={className}
      style={style}
      onMouseDown={onMouseDown}
    >
      {children}
    </div>
  );
};
