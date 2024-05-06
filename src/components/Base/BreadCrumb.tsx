// Component for displaying and quickly navigating related routes

import { Flex, Button, useColorMode } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { IBreadCrumbProps } from "../../types";

export const BreadCrumb = ({
  subDirOne,
  subDirTwo,
  subDirThree,
  rightSideElement,
}: IBreadCrumbProps) => {
  const navigate = useNavigate();

  const { colorMode } = useColorMode();

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
      >
        <Flex>
          <Button
            onClick={() => {
              navigate({ to: "/" });
            }}
            variant={"link"}
            colorScheme="blue"
          >
            Home
          </Button>
          &nbsp;/&nbsp;
          <Button
            onClick={() => {
              navigate({ to: subDirOne.link });
            }}
            variant={"link"}
            colorScheme="blue"
          >
            {subDirOne.title}
          </Button>
          {subDirTwo ? (
            <>
              &nbsp;/&nbsp;
              <Button
                onClick={() => {
                  navigate({ to: subDirTwo.link });
                }}
                variant={"link"}
                colorScheme="blue"
              >
                {subDirTwo.title}
              </Button>
              {subDirThree ? (
                <>
                  &nbsp;/&nbsp;
                  <Button
                    onClick={() => {
                      navigate({ to: subDirThree.link });
                    }}
                    variant={"link"}
                    colorScheme="blue"
                  >
                    {subDirThree.title}
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
