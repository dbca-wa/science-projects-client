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
  <div className="p-4">
    <div className="flex min-w-[270px] justify-between">
      <p className="text-lg font-semibold">{title}</p>
      {button && button}
    </div>
    {divider && <Divider mt={2} mb={1} bg={"gray.300"} />}
    {children}
  </div>
);
export default Subsection;
