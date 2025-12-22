import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { type IconType } from "react-icons";
import { FiPlusCircle } from "react-icons/fi";

interface Props {
  ariaLabel: string;
  label: string;
  onClick: () => void;
  innerItemSize?: string;
  icon?: IconType;
}

const AddItemButton = ({
  ariaLabel,
  label,
  onClick,
  icon,
  innerItemSize,
}: Props) => {
  const Icon = icon || FiPlusCircle;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={ariaLabel}
            onClick={onClick}
            className="h-[30px] w-[30px] rounded-full bg-blue-500 p-0.5 text-white hover:bg-blue-400"
            size="sm"
          >
            <Icon color="white" size={innerItemSize ? innerItemSize : "25px"} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default AddItemButton;
