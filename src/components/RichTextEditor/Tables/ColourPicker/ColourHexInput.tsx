import { useColorMode } from "@chakra-ui/react";

interface IHexInput {
  value: string;
  onChange: (val: string) => void;
}

export const ColourHexInput = ({ value, onChange }: IHexInput) => {
  const { colorMode } = useColorMode();
  const menuBgColor = colorMode === "light" ? "bg-white" : "bg-gray-800";
  const textColor = colorMode === "light" ? "text-black" : "text-white";

  const darkClass = `flex min-w-0 flex-[2] rounded-[5px] border border-[#999] px-[10px] py-[7px] text-[16px] ${menuBgColor} ${textColor}`;
  const lightClass = `flex min-w-0 flex-[2] rounded-[5px] border border-[#999] px-[10px] py-[7px] text-[16px] ${menuBgColor} ${textColor}`;
  return (
    <div className="mb-[10px] flex flex-row items-center">
      <label
        className={`flex flex-1 self-center text-center ${menuBgColor} ${textColor}`}
      >
        Hex
      </label>
      <input
        className={colorMode === "light" ? lightClass : darkClass}
        placeholder=""
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
