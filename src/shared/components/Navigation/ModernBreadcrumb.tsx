// Modern Breadcrumb component in header

import { Button } from "@/shared/components/ui/button";
import { useColorMode } from "@/shared/utils/theme.utils";
import { motion } from "framer-motion";
import { Fragment } from "react";
import { AiFillHome } from "react-icons/ai";
import { useUpdatePage } from "@/shared/hooks/useUpdatePage";

export const ModernBreadcrumb = () => {
  const { currentPage, updatePageContext } = useUpdatePage();
  const { colorMode } = useColorMode();
  const updateHome = () => {
    updatePageContext("/");
  };

  const handleUnderscores = (text: string) => {
    let updated = text;
    if (text.includes("_")) {
      updated = updated.replaceAll("_", " ");
    }
    return updated;
  };

  const pages = currentPage.split("/").filter((page) => page !== "");
  const breadcrumbItems = pages.map((page, index) => {
    const isLast = index === pages.length - 1;
    const path = `/${pages.slice(0, index + 1).join("/")}`;
    const handleClick = () => updatePageContext(path);
    const capitalizedPage = handleUnderscores(
      page.charAt(0).toUpperCase() + page.slice(1),
    );

    return (
      <Fragment key={page}>
        {!isLast && (
          <Button
            size="sm"
            onClick={handleClick}
            variant="link"
            className={`${
              colorMode === "light" ? "text-blue-500 hover:text-blue-400" : "text-blue-300 hover:text-blue-200"
            }`}
          >
            {capitalizedPage}
          </Button>
        )}
        {!isLast && <span>&nbsp;&gt;</span>}
        {isLast && (
          <Button
            size="sm"
            onClick={handleClick}
            variant="link"
            className={`font-normal ${
              colorMode === "light" ? "text-blue-500 hover:text-blue-400" : "text-blue-300 hover:text-blue-200"
            }`}
          >
            {capitalizedPage}
          </Button>
        )}
      </Fragment>
    );
  });

  const isBaseRoute = pages.length === 0;

  return (
    <motion.div initial={{ opacity: 1, y: 0 }}>
      <div
        className={`${
          colorMode === "dark" ? "bg-gray-700" : "bg-gray-100"
        } rounded-md relative flex justify-between select-none ml-10 py-1 px-2`}
      >
        {isBaseRoute ? (
          <div
            className={`flex items-center justify-center cursor-pointer ${
              colorMode === "light" ? "text-blue-500" : "text-blue-300"
            }`}
            onClick={updateHome}
          >
            <AiFillHome />
          </div>
        ) : null}
        <div className="flex">{breadcrumbItems}</div>
      </div>
    </motion.div>
  );
};
