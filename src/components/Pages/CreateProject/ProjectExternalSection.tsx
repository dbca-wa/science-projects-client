// Tab data for Project External Project info on the creation page.

import { Button, Flex, FormControl, FormHelperText, FormLabel, Grid, Input, InputGroup, InputLeftAddon, ModalBody, ModalFooter, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "../../../styles/modalscrollbar.css";
import { IoIosCreate } from "react-icons/io";
import { ICreateProjectExternalDetails } from "../../../lib/api";
import { MdCorporateFare, MdOutlineTitle } from "react-icons/md";
import { AiFillDollarCircle } from "react-icons/ai";
import { StateRichTextEditor } from "../../RichTextEditor/Editors/StateRichTextEditor";
import { SimpleStateRichTextEditor } from "../../RichTextEditor/Editors/SimpleStateRichTextEditor";

interface IProjectExternalProps {
    externalFilled: boolean;
    setExternalFilled: React.Dispatch<React.SetStateAction<boolean>>;
    externalData: ICreateProjectExternalDetails;
    setExternalData: (data: any) => void;
    createClick: () => void;
    onClose: () => void;
    backClick: () => void;
}

export const ProjectExternalSection = (
    {
        backClick,
        createClick,
        externalFilled,
        setExternalFilled,
        externalData,
        setExternalData,
    }: IProjectExternalProps
) => {

    const [externalDescription, setExternalDescription] = useState<string>("");
    const [aims, setAims] = useState<string>("");
    const [budget, setBudget] = useState<string>("");
    const [collaborationWith, setCollaborationWith] = useState<string>("");

    useEffect(() => {
        setExternalData({
            "externalDescription": externalDescription,
            "aims": aims,
            "budget": budget,
            "collaborationWith": collaborationWith,
        });
    }, [externalDescription, aims, budget, collaborationWith]);


    useEffect(() => {
        if (
            externalDescription.length > 0 && aims.length > 0 && budget.length > 0 && collaborationWith.length > 0
        ) {
            console.log(externalData)
            setExternalFilled(true)
        }
        else {
            console.log(
                externalDescription.length,
                aims.length,
                collaborationWith.length

            )
            setExternalFilled(false);

        }
    }, [externalData, aims, budget, collaborationWith, externalDescription, setExternalFilled])


    return (
        <>
            <FormControl
                pb={6}
                isRequired
            >
                <FormLabel>Collaboration With</FormLabel>
                <InputGroup>
                    <InputLeftAddon children={<MdCorporateFare />} />
                    <Input
                        placeholder="Enter collaborating entities..."
                        value={collaborationWith}
                        onChange={(e) => {
                            setCollaborationWith(e.target.value);
                        }}
                        // {...register("name", { required: true })}
                        type="text"
                    />
                </InputGroup>
                <FormHelperText>The entity/s this project is in collaboration with</FormHelperText>
            </FormControl>


            <FormControl
                pb={6}
                isRequired
            >
                <FormLabel>Budget</FormLabel>
                <InputGroup>
                    <InputLeftAddon children={<AiFillDollarCircle />} />
                    <Input
                        placeholder="Enter the budget of the project..."
                        value={budget}
                        onChange={(e) => {
                            setBudget(e.target.value);
                        }}
                        // {...register("name", { required: true })}
                        type="number"
                    />
                </InputGroup>
                <FormHelperText>The estimated operating budget in dollars</FormHelperText>
            </FormControl>


            <FormControl isRequired mb={6}>
                <FormLabel>Description</FormLabel>
                <InputGroup>
                    {/* <Textarea
                            placeholder={`Enter the description of the external project...`}
                            value={externalDescription}
                            onChange={(event) => setExternalDescription(event.target.value)}
                        /> */}
                    <SimpleStateRichTextEditor
                        section="externalDescription"
                        editorType="ProjectDetail"
                        isUpdate={false}
                        value={externalDescription}
                        setValueFunction={setExternalDescription}
                    />
                </InputGroup>
                <FormHelperText>Description specific to this external project.</FormHelperText>
            </FormControl>

            <FormControl isRequired mb={6}>
                <FormLabel>Aims</FormLabel>
                <InputGroup>
                    {/* <Textarea
                            placeholder={`Enter the aims of the project...`}
                            value={aims}
                            onChange={(event) => setAims(event.target.value)}
                        /> */}
                    <SimpleStateRichTextEditor
                        section="externalAims"
                        editorType="ProjectDetail"
                        isUpdate={false}
                        value={aims}
                        setValueFunction={setAims}
                    />
                </InputGroup>
                <FormHelperText>List out the aims of your project.</FormHelperText>
            </FormControl>
            <Flex
                w={"100%"}
                justifyContent={"flex-end"}
                pb={4}
            >
                <Grid
                    gridTemplateColumns={"repeat(2, 1fr)"}
                    gridGap={4}
                >
                    <Button
                        colorScheme="gray"

                        onClick={backClick}
                    >
                        Cancel
                    </Button>

                    <Button
                        ml={3}
                        type="submit"
                        colorScheme="blue"
                        isDisabled={!externalFilled}
                        onClick={() => {
                            console.log('Here is the external data'
                            )
                            console.log(externalData)
                            createClick()

                        }}
                        rightIcon={<IoIosCreate />}
                    >
                        Create
                    </Button>
                </Grid>
            </Flex>
        </>
    )
}
