// Section to provide base information on a project before proceeding to the details and location

import { Box, Button, FormControl, FormHelperText, FormLabel, Input, InputGroup, ModalBody, ModalFooter, Grid, VisuallyHiddenInput, InputLeftElement, Icon, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "../../../styles/modalscrollbar.css";
import TagInput from "./TagInput";
import { ImagePreview } from "./ImagePreview";
import { MdTitle } from "react-icons/md";
import { useQueryClient } from '@tanstack/react-query';
import { IUserData } from "../../../types";
import { motion } from "framer-motion";

interface IProjectBaseInformationProps {
    projectKind: string;
    onClose: () => void;
    colorMode: string;
    nextClick: (data: any) => void;
    currentYear: number;
    baseInformationFilled: boolean;
    setBaseInformationFilled: React.Dispatch<React.SetStateAction<boolean>>
}

export const ProjectBaseInformation = ({ projectKind, baseInformationFilled, setBaseInformationFilled, currentYear, nextClick, onClose, colorMode }: IProjectBaseInformationProps) => {

    const [showPulsate, setShowPulsate] = useState(false);


    useEffect(() => {
        if (baseInformationFilled === true) {
            // Start the pulsating effect
            setShowPulsate(true);
            // Stop the pulsating effect after a short delay (1 second in this example)
            setTimeout(() => {
                setShowPulsate(false);
            }, 1000);
        }
    }, [baseInformationFilled])


    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const queryClient = useQueryClient();
    const meData = queryClient.getQueryData<IUserData>(['me']);

    const [projectTitle, setProjectTitle] = useState('');
    const [projectSummary, setProjectSummary] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    useEffect(() => {
        if (
            projectTitle !== '' &&
            projectSummary !== '' &&
            keywords.length !== 0 &&
            selectedFile !== null &&
            meData !== undefined &&
            meData.pk !== 0 && meData.pk !== undefined
        ) {
            setBaseInformationFilled(true);
        } else {
            setBaseInformationFilled(false);

        }

    }, [
        currentYear,
        meData,
        projectTitle,
        projectSummary,
        keywords,
        selectedFile,
        setBaseInformationFilled,
    ])

    return (
        <>
            <ModalBody overflowY="auto" maxHeight="58vh">
                <Grid
                    gridTemplateColumns={"repeat(2, 1fr)"}
                    gridColumnGap={10}
                >
                    <Box>
                        {/* HIDING PROJECT YEAR */}
                        <InputGroup>
                            <VisuallyHiddenInput
                                type="text"
                                placeholder="Year"
                                value={currentYear}
                                onChange={() => { console.log(currentYear) }}
                            />
                        </InputGroup>

                        <InputGroup>
                            <VisuallyHiddenInput
                                type="text"
                                placeholder="Kind"
                                value={projectKind}
                                onChange={() => { console.log(projectKind) }}
                            />
                        </InputGroup>


                        <FormControl isRequired mb={4} >
                            <FormLabel>Project Title</FormLabel>
                            <InputGroup>
                                <InputLeftElement children={<Icon as={MdTitle} />} />
                                <Input
                                    type="text"
                                    placeholder={`Type your Project Title here...`}
                                    value={projectTitle}
                                    onChange={(event) => setProjectTitle(event.target.value)}
                                    maxLength={30}
                                // pattern="[A-Za-z0-9@.+_-]*" 
                                />
                            </InputGroup>
                            <FormHelperText>The project title with formatting if required (e.g. for taxonomic names).</FormHelperText>
                        </FormControl>


                        <TagInput setTagFunction={setKeywords} />

                        <FormControl isRequired mb={6}>
                            <FormLabel>Project Summary</FormLabel>
                            <InputGroup>
                                <Textarea
                                    placeholder={`Type your summary here...`}
                                    value={projectSummary}
                                    onChange={(event) => setProjectSummary(event.target.value)}
                                />
                            </InputGroup>
                            <FormHelperText>A concise project summary, or any additional useful information.</FormHelperText>
                        </FormControl>

                    </Box>

                    <Box>
                        <FormControl my={4}>
                            <FormLabel>Image</FormLabel>
                            <InputGroup>
                                <Button
                                    as="label"
                                    htmlFor="fileInput"
                                    pt={1}
                                    display="inline-flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    bg={colorMode === "light" ? "gray.200" : "gray.700"}
                                    color={colorMode === "light" ? "black" : "white"}
                                    cursor={"pointer"}
                                >
                                    Choose File
                                </Button>
                                <Input
                                    id="fileInput"
                                    type="file"
                                    onChange={handleFileInputChange}
                                    opacity={0}
                                    position="absolute"
                                    width="0.1px"
                                    height="0.1px"
                                    zIndex="-1"
                                />
                            </InputGroup>
                            <FormHelperText>
                                Upload an image that represents the project.
                            </FormHelperText>
                        </FormControl>

                        <ImagePreview selectedFile={selectedFile} />

                    </Box>


                </Grid>

            </ModalBody>
            <ModalFooter>
                <Button onClick={onClose}>Cancel</Button>
                <motion.div
                    animate={{
                        scale: showPulsate ? [1, 1.2, 1] : 1, // Keyframes for pulsating effect
                    }}
                    transition={{
                        repeat: showPulsate ? Infinity : 0,
                        duration: 1, // Animation duration in seconds
                    }}
                >
                    <Button
                        isDisabled={!baseInformationFilled}
                        colorScheme="blue"
                        ml={3}
                        onClick={
                            () => {
                                if (baseInformationFilled) {
                                    console.log("going next")
                                    nextClick(
                                        {
                                            "kind": projectKind,
                                            "year": currentYear,
                                            "creator": meData?.pk,
                                            "title": projectTitle,
                                            "description": projectSummary,
                                            "keywords": keywords,
                                            "imageData": selectedFile
                                        }
                                    )
                                } else return;
                            }
                        }
                    >
                        Next &rarr;
                    </Button>
                </motion.div>
            </ModalFooter>
        </>
    );
};


