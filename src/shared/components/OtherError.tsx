// Error handler for non-404 errors.

import { Link, useNavigate } from "react-router-dom";
import { useColorMode } from "@/shared/utils/theme.utils";
import { AiFillHome } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";

interface GenericErrorProps {
  code: number;
  message: string;
  stack?: string; // Stack trace prop
}

export const OtherError = ({ code, message, stack }: GenericErrorProps) => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className={`flex justify-center items-center min-h-screen ${
      colorMode === "dark" ? "bg-gray-800" : "bg-gray-100"
    }`}>
      <div className="grid grid-cols-1 grid-rows-4 h-full">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-3xl font-bold">Error: {code}</h1>
          <p>Oh, oh. We have an error!</p>
          <p>{message}</p>
          <div className="grid grid-cols-2 gap-20">
            <Link to="/">
              <button className="flex items-center text-blue-500 hover:text-blue-600 underline">
                <AiFillHome className="mr-2" />
                Go home
              </button>
            </Link>
            <button
              className="flex items-center text-blue-500 hover:text-blue-600 underline"
              onClick={goBack}
            >
              <IoIosArrowBack className="mr-2" />
              Go back
            </button>
          </div>
          <div className="flex justify-center p-20">
            <p>{stack}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
