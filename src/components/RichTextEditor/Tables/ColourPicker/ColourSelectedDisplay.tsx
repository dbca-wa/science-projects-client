import { Color } from "@/types";

interface Props {
  selfColor: Color;
}
export const ColourSelectedDisplay = ({ selfColor }: Props) => {
  return (
    <div
      className="my-4 h-[20px] w-full border border-[#ccc]"
      style={{ backgroundColor: selfColor.hex }}
    />
  );
};
