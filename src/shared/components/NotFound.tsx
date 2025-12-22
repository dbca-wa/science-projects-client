// Error component for 404 - displays the error in page. WIP as design in displaying data needs work.
// Needs to be in the middle.

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useColorMode } from "@/shared/utils/theme.utils";
import { AiFillHome } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";

export const NotFound = () => {
  const { colorMode } = useColorMode();
  const location = useLocation();
  const urlpath = location.pathname;
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
          <h1 className="text-3xl font-bold">Page not found.</h1>
          <p className="text-center">
            Oh, oh. We couldn't find{" "}
            <kbd className={`px-1 pb-0 ${
              colorMode === "dark" ? "bg-gray-600" : "bg-gray-300"
            } rounded`}>
              {urlpath}
            </kbd>{" "}
            on this server.
          </p>
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
        </div>
      </div>
    </div>
  );
};
