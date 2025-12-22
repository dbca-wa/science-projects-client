// WIP Error component for 404 - displays the error in page. WIP as design in displaying data needs work.
// Needs to be in the middle.

import { Button } from "@/shared/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils";

import { AiFillHome } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";

export const NotFound = () => {
  const location = useLocation();
  const urlpath = location.pathname;
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="grid grid-cols-1 grid-rows-4 h-full">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold">Page not found.</h1>
          <p className="text-lg">
            Oh, oh. We couldn't find{" "}
            <kbd className="bg-gray-300 dark:bg-gray-600 px-2 py-1 rounded text-sm font-mono">
              {urlpath}
            </kbd>{" "}
            on this server.
          </p>
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
        </div>
      </div>
    </div>
  );
};
