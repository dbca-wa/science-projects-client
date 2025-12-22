import { useTheme } from "next-themes";

interface IProps {
  onClick?: () => void;
  name?: string;
}

export const TextButtonFlex = ({ onClick, name }: IProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <div className="flex justify-start max-w-full pr-8 items-center">
      <span
        className={`font-semibold whitespace-normal text-ellipsis ${
          name
            ? `${
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-400"
              } hover:underline cursor-pointer`
            : ""
        }`}
        onClick={onClick && onClick}
      >
        {name ?? "-"}
      </span>
    </div>
  );
};
