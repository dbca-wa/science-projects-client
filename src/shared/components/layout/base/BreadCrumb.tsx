// Component for displaying and quickly navigating related routes

import { Flex, Button, useColorMode } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import type { IBreadCrumbProps } from "@/shared/types";

export const BreadCrumb = ({
  subDirOne,
  subDirTwo,
  subDirThree,
  rightSideElement,
}: IBreadCrumbProps) => {
  const navigate = useNavigate();

  const { colorMode } = useColorMode();

  const handleUnderscores = (text: string) => {
    let updated = text;
    if (text.includes("_")) {
      updated = updated.replaceAll("_", " ");
    }
    return updated;
  };

  return (
    <>
      <Flex
        bgColor={colorMode === "dark" ? "gray.700" : "gray.100"}
        rounded={6}
        px={4}
        py={2}
        pos={"relative"}
        justifyContent={"space-between"}
        userSelect={"none"}
        color={colorMode === "dark" ? "gray.400" : null}
      >
        <Flex>
          <Button
            onClick={() => {
              navigate("/");
            }}
            variant={"link"}
            colorScheme="blue"
          >
            Home
          </Button>
          &nbsp;/&nbsp;
          <Button
            onClick={() => {
              navigate(subDirOne.link);
            }}
            variant={"link"}
            colorScheme="blue"
          >
            {handleUnderscores(subDirOne.title)}
          </Button>
          {subDirTwo ? (
            <>
              &nbsp;/&nbsp;
              <Button
                onClick={() => {
                  navigate(subDirTwo.link);
                }}
                variant={"link"}
                colorScheme="blue"
              >
                {handleUnderscores(subDirTwo.title)}
              </Button>
              {subDirThree ? (
                <>
                  &nbsp;/&nbsp;
                  <Button
                    onClick={() => {
                      navigate(subDirThree.link);
                    }}
                    variant={"link"}
                    colorScheme="blue"
                  >
                    {handleUnderscores(subDirThree.title)}
                  </Button>
                </>
              ) : null}
            </>
          ) : null}
        </Flex>
        {rightSideElement ? <Flex>{rightSideElement}</Flex> : null}
      </Flex>
    </>
  );
};
