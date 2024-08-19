import { Button, ButtonProps, Tooltip } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { FiPlusCircle } from "react-icons/fi";

interface Props extends ButtonProps {
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
  ...props
}: Props) => {
  const Icon = icon || FiPlusCircle;

  return (
    <Tooltip aria-label={ariaLabel} label={label}>
      <Button
        color={"white"}
        _hover={{ bg: "blue.400" }}
        cursor={"pointer"}
        onClick={onClick}
        rounded={"full"}
        bg={"blue.500"}
        size={"30px"}
        as={"div"}
        p={"2px"}
        {...props}
      >
        <Icon color="white" size={innerItemSize ? innerItemSize : "25px"} />
      </Button>
    </Tooltip>
  );
};
export default AddItemButton;
