// Used on project creation page to display a preview of the uploaded image

import { Box, Image } from "@chakra-ui/react";

export const NewImagePreview: React.FC<
    { selectedFile: File | null, currentString: string }
> = ({ selectedFile, currentString }) => {
    const aspectRatio = 9 / 16; // 16:9 aspect ratio
    const width = 600;
    const height = width * aspectRatio;

    // console.log(URL.createObjectURL(selectedFile))
    const imageUrl = selectedFile ? URL.createObjectURL(selectedFile) : currentString;

    return (
        <>
            {imageUrl && (
                <Box
                    top={0}
                    left={0}
                    maxH={"350px"}
                    maxW={"100%"}

                    userSelect={"none"}
                    rounded="2xl"
                    // h={`${height}px`}
                    // w={`${width}px`}
                    pos="relative"
                    overflow="hidden"
                    cursor="pointer"
                    style={{ transformStyle: 'preserve-3d' }}
                    boxShadow="0px 20px 30px -10px rgba(0, 0, 0, 0.3), 0px 4px 5px -2px rgba(0, 0, 0, 0.06), -3px 0px 10px -2px rgba(0, 0, 0, 0.1), 3px 0px 10px -2px rgba(0, 0, 0, 0.1)"
                >
                    <Image
                        src={imageUrl}
                        alt="Preview"
                        objectFit="cover"
                        h="100%"
                        w="100%"
                    />
                </Box>
            )}


        </>
    );
};
