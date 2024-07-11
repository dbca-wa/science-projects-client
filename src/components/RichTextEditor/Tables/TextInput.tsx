import { Flex, Input } from "@chakra-ui/react";

import { HTMLInputTypeAttribute } from "react";

type Props = Readonly<{
  "data-test-id"?: string;
  label: string;
  onChange: (val: string) => void;
  placeholder?: string;
  value: string;
  type?: HTMLInputTypeAttribute;
}>;

export default function TextInput({
  label,
  value,
  onChange,
  placeholder = "",
  "data-test-id": dataTestId,
  type = "text",
}: Props): JSX.Element {
  //   const { colorMode } = useColorMode();
  return (
    <Flex flexDir={"row"} alignItems={"center"} mb={"10px"}>
      <label className="flex flex-1 self-center text-[#666]">{label}</label>
      <Input
        border={"1px solid #999"}
        display={"flex"}
        flex={2}
        py={"7px"}
        px={"10px"}
        fontSize={"16px"}
        borderRadius={"5px"}
        minW={0}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        data-test-id={dataTestId}
      />
    </Flex>
  );
}
