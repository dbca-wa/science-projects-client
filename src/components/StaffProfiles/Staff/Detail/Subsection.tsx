import { Divider } from "@chakra-ui/react";
import { ReactElement, ReactNode } from "react";

const Subsection = ({
  title,
  button,
  children,
  divider,
}: {
  title: string;
  children: ReactNode;
  button?: ReactElement;
  divider?: boolean;
}) => (
  <div className="w-full p-4">
    <div className="flex w-full min-w-[270px] justify-between">
      <p className="text-lg font-semibold">{title}</p>
      {button && button}
    </div>
    {divider && <Divider mt={2} mb={1} bg={"gray.300"} />}
    <div className="w-full">{children}</div>
  </div>
);
export default Subsection;
