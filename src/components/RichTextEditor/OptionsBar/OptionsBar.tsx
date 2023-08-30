// The options bar which sits below the text area in the simple rich text editor

import { Flex, Grid, useColorMode } from "@chakra-ui/react"
import { WordCount } from "./WordCount"
import { ClearButton } from "../Buttons/ClearButton";
import { ReadOnlyModeButton } from "../Buttons/ReadOnlyModeButton";

interface IOptionsBarProps {
    editorText: string | null;
}

export const OptionsBar = ({ editorText }: IOptionsBarProps) => {
    const { colorMode } = useColorMode();

    return (
        <Flex
            // background={"orange"}
            height={20}
            width={"100%"}
            bottom={0}
        >
            <Flex
                justifyContent="flex-start"
                alignItems="center"
                flex={1}
                px={10}

            >
                <WordCount text={editorText} />
            </Flex>

            <Flex justifyContent="flex-end" alignItems="center" flex={1}>

                <Grid
                    px={10}
                    py={4}
                    gridTemplateColumns={"repeat(2, 1fr)"}
                    // width={"100%"}
                    gridColumnGap={2}
                >
                    <ClearButton />
                    {/* <UploadButton /> */}
                    {/* <DownloadButton /> */}
                    <ReadOnlyModeButton />
                    {/* <MarkDownConversionButton /> */}
                </Grid>
            </Flex>
        </Flex>
    )
}