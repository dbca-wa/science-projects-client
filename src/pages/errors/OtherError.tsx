// WIP: Error handler for non-404 errors.

import { Button } from "@/shared/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

import { AiFillHome } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";

interface GenericErrorProps {
  code: number;
  message: string;
  stack?: string; // Stack trace prop
}

export const OtherError = ({ code, message, stack }: GenericErrorProps) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="grid grid-cols-1 grid-rows-4 h-full">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold">Error: {code}</h1>
          <p className="text-lg">Oh, oh. We have an error!</p>
          <p className="text-base">{message}</p>
          <div className="grid grid-cols-2 gap-20">
            <Link to="/">
              <Button
                variant="link"
                className="text-blue-500 hover:text-blue-600"
              >
                <AiFillHome className="mr-2" />
                Go home
              </Button>
            </Link>
            <Button
              variant="link"
              className="text-blue-500 hover:text-blue-600"
              onClick={goBack}
            >
              <IoIosArrowBack className="mr-2" />
              Go back
            </Button>
          </div>
          <div className="flex justify-center p-20">
            <p className="text-sm text-gray-600 dark:text-gray-400">{stack}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
