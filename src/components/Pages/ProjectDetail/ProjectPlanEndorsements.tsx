import { Box, Button, Checkbox, Flex, Grid, Switch, Tag, Text, ToastId, useDisclosure, useToast } from "@chakra-ui/react"
import { IProjectPlan, IUserData, IUserMe } from "../../../types"
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ISpecialEndorsement, setEndorsement } from "../../../lib/api";
import { SeekEndorsementModal } from "../../Modals/SeekEndorsementModal";


interface IEndorsementProps {
    document: IProjectPlan
    userData: IUserMe;
    userIsLeader: boolean;
}

export const ProjectPlanEndorsements = (
    { document, userData, userIsLeader, }: IEndorsementProps
) => {
    const { register, handleSubmit, reset, watch, setValue } = useForm<ISpecialEndorsement>();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const involvesPlantsValue = watch('involvesPlants');
    const involvesAnimalsValue = watch('involvesAnimals');

    const dmEndReqValue = watch('dataManagerEndorsementRequired');
    const hcEndReqValue = watch('herbariumEndorsementRequired');
    const aecEndReqValue = watch('aecEndorsementRequired');
    const bmEndRequiredValue = watch('bmEndorsementRequired');

    const dmEndProvidedValue = watch('dataManagerEndorsementProvided')
    const hcEndProvidedValue = watch('herbariumEndorsementProvided');
    const aecEndProvidedValue = watch('aecEndorsementProvided');
    const bmEndProvidedValue = watch('bmEndorsementProvided');


    useEffect(() => console.log({
        dmEndReqValue: dmEndReqValue,
        dmEndProvidedValue: dmEndProvidedValue,
        bmEndRequiredValue: bmEndRequiredValue,
        bmEndProvidedValue: bmEndProvidedValue,
        involvesPlantsValue: involvesPlantsValue,
        hcEndReqValue: hcEndReqValue,
        hcEndProvidedValue: hcEndProvidedValue,
        involvesAnimalsValue: involvesAnimalsValue,
        aecEndReqValue: aecEndReqValue,
        aecEndProvidedValue: aecEndProvidedValue,

    }), [
        dmEndReqValue, dmEndProvidedValue,
        involvesPlantsValue, involvesAnimalsValue,
        bmEndRequiredValue, bmEndProvidedValue,
        aecEndReqValue, aecEndProvidedValue,
        hcEndReqValue, hcEndProvidedValue,
    ]);

    // const [involvesDataCollection, setInvolvesDataCollection] = useState(true);

    const [involvesPlants, setInvolvesPlants] = useState(document?.involves_plants);
    const [involvesAnimals, setInvolvesAnimals] = useState(document?.involves_animals);

    // useEffect(() => {
    //     console.log(involvesAnimals)
    //     if (involvesAnimals === false) {
    //         setValue("aecEndorsementRequired", false);
    //         setValue("aecEndorsementProvided", false);
    //     }
    // }, [involvesAnimals])

    const [aecEndRequired, setAecEndRequired] = useState(document?.endorsements?.ae_endorsement_required);
    const [hcEndRequired, setHcEndRequired] = useState(document?.endorsements?.hc_endorsement_required);

    const [hcEndProvided, setHcEndProvided] = useState(document?.endorsements?.hc_endorsement_provided);
    const [aecEndProvided, setAecEndProvided] = useState(document?.endorsements?.ae_endorsement_provided);


    const [dmEndProvided, setDmEndProvided] = useState(document?.endorsements?.dm_endorsement_provided);
    const [dmEndRequired, setDmEndRequired] = useState(document?.endorsements?.dm_endorsement_required);



    const [bmEndProvided, setBmEndProvided] = useState(document?.endorsements?.bm_endorsement_provided);
    const [bmEndRequired, setBmEndRequired] = useState(document?.endorsements?.bm_endorsement_required);

    const [herbCuratorInteractable, setHerbCuratorInteractable] = useState(false);
    const [aecInteractable, setAecInteractable] = useState(false);


    const [userCanEditDMEndorsement, setUserCanEditDMEndorsement] = useState(false);
    const [userCanEditHCEndorsement, setUserCanEditHCEndorsement] = useState(false);
    const [userCanEditBMEndorsement, setUserCanEditBMEndorsement] = useState(false);
    const [userCanEditAECEndorsement, setUserCanEditAECEndorsement] = useState(false);

    useEffect(() => {
        if (userData?.is_superuser || userIsLeader) {
            setUserCanEditDMEndorsement(true);
        } else {
            setUserCanEditDMEndorsement(false);
        }
    }, [userData, userIsLeader]);

    useEffect(() => {
        if (userData?.is_superuser || userData?.is_herbarium_curator) {
            setUserCanEditHCEndorsement(true);
        } else {
            setUserCanEditHCEndorsement(false);
        }
    }, [userData]);

    useEffect(() => {
        if (userData?.is_superuser || userData?.is_biometrician) {
            setUserCanEditBMEndorsement(true);
        } else {
            setUserCanEditBMEndorsement(false);
        }
    }, [userData]);


    useEffect(() => {
        if (userData?.is_superuser || userData?.is_aec) {
            setUserCanEditAECEndorsement(true);
        } else {
            setUserCanEditAECEndorsement(false);
        }
    }, [userData]);

    // const handleTogglePlantsInvolved = () => {
    //     setInvolvesPlants((prev) => !prev);
    // }

    // const handleToggleAnimalsInvolved = () => {
    //     setInvolvesAnimals((prev) => !prev);
    // }


    useEffect(() => {
        if (involvesAnimals === true && aecEndRequired === true) {
            setAecInteractable(true)
        }
        else {
            setAecInteractable(false)
        }
    }, [involvesAnimals, aecEndRequired])

    useEffect(() => {
        if (involvesPlants === true && hcEndRequired === true) {
            setHerbCuratorInteractable(true);
        }
        else {
            setHerbCuratorInteractable(false);
        }
    }, [involvesPlants, hcEndRequired])


    const queryClient = useQueryClient();
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    const endorsementMutation = useMutation(setEndorsement,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: "Creating Task",
                    position: "top-right"
                })
            },
            onSuccess: (data) => {

                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Task Created`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                reset()
                // onClose()

                setTimeout(() => {

                    queryClient.invalidateQueries(["projects"]);

                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Create Task',
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })

    const onSubmitUpdateEndorsement = (formData: ISpecialEndorsement) => {
        endorsementMutation.mutate(formData);
    }




    return (
        <>
            <SeekEndorsementModal
                projectPlanPk={document?.pk}

                dataManagerEndorsementRequired={dmEndReqValue}
                dataManagerEndorsementProvided={dmEndProvidedValue}

                biometricianEndorsementRequired={bmEndRequiredValue}
                biometricianEndorsementProvided={bmEndProvidedValue}

                involvesPlants={involvesPlantsValue}
                herbariumEndorsementRequired={hcEndReqValue}
                herbariumEndorsementProvided={hcEndProvidedValue}

                involvesAnimals={involvesAnimalsValue}
                aecEndorsementRequired={aecEndReqValue}
                aecEndorsementProvided={aecEndProvidedValue}

                isOpen={isOpen}
                onClose={onClose}
            />
            <Box
                background={"gray.50"}
                rounded={"lg"}
                p={4}
                w={"100%"}
                mb={6}
            >


                <Flex
                    flexDir={"column"}
                >


                    {/* Contents */}
                    <Grid
                        background={"gray.100"}
                        rounded={"lg"}
                        p={6}
                        w={"100%"}
                    // gridRowGap={2}
                    >
                        {/* Title */}
                        <Box
                            mb={4}
                        >
                            <Text
                                fontWeight={"bold"}
                                fontSize={"xl"}
                            >
                                Involvement & Endorsements
                            </Text>
                        </Box>
                        {/* Data Collection */}
                        {/* <Grid
                            gridTemplateColumns={"repeat(1, 1fr)"}
                            gridRowGap={4}
                            alignItems={"center"}
                            userSelect={"none"}
                            border={"1px solid"}
                            borderColor={"gray.300"}
                            p={4}
                            rounded={"xl"}
                            roundedBottom={0}
                        >
                            <Flex>

                                <Box
                                    flex={1}
                                >
                                    <Text
                                        fontWeight={"semibold"}
                                    >
                                        Data Collection Required?
                                    </Text>
                                </Box>
                                <Checkbox
                                    defaultChecked={
                                        dmEndRequired
                                    }
                                    {...register('dataManagerEndorsementRequired', { value: dmEndRequired })}
                                    {...register('dataManagerEndorsementRequired', { value: true })}

                                    mr={3}
                                />

                            </Flex>


                            <Flex
                                // alignItems={"center"}
                                w={"100%"}
                                alignItems={"center"}
                                mb={3}
                            >


                                <Box
                                    flex={1}
                                >
                                    <Text
                                        color={dmEndReqValue ? "black" : "gray.500"}
                                    >
                                        Data Manager's Endorsement
                                    </Text>
                                </Box>

                                <Flex
                                >
                                    {!userCanEditDMEndorsement
                                        ?
                                        (
                                            <Tag
                                                alignItems={"center"}
                                                justifyContent={"center"}
                                                display={"flex"}
                                                bg={document?.endorsements?.dm_endorsement_provided === true ? "green.500" : "red.500"}
                                                color={"white"}
                                            >
                                                {document?.endorsements?.dm_endorsement_provided === true ? "Granted" : "Required"}
                                            </Tag>
                                        )
                                        :
                                        (
                                            <Switch
                                                defaultChecked={
                                                    document.endorsements.hc_endorsement_provided === true
                                                }
                                                {...register('dataManagerEndorsementProvided', { value: dmEndProvided })}
                                                isDisabled={!dmEndReqValue}
                                            />
                                        )
                                    }

                                </Flex>

                            </Flex>

                        </Grid> */}

                        {/* Biometrician */}
                        <Grid
                            gridTemplateColumns={"repeat(1, 1fr)"}
                            gridRowGap={4}
                            alignItems={"center"}
                            userSelect={"none"}
                            border={"1px solid"}
                            borderColor={"gray.300"}
                            p={4}
                            rounded={"xl"}
                            roundedTop={'xl'}
                            // borderTop={0}
                            roundedBottom={0}
                        >

                            <Flex
                                alignItems={"center"}
                                userSelect={"none"}
                            >

                                <Box
                                    flex={1}
                                >
                                    <Text
                                        fontWeight={"semibold"}
                                    >
                                        Biometrician Endorsement Required?
                                    </Text>
                                </Box>
                                <Checkbox
                                    defaultChecked={
                                        bmEndRequired
                                    }
                                    mr={3}
                                    {...register("bmEndorsementRequired", { value: bmEndRequired })}

                                // isDisabled
                                />


                            </Flex>

                            <Flex
                                alignItems={"center"}
                                w={"100%"}
                            >
                                <Box
                                    flex={1}
                                >
                                    <Text
                                        color={bmEndRequiredValue ? "black" : "gray.500"}
                                    >
                                        Biometrician's Endorsement</Text>
                                </Box>

                                <Flex

                                >
                                    {
                                        !userCanEditBMEndorsement ?
                                            (
                                                <Tag
                                                    alignItems={"center"}
                                                    justifyContent={"center"}
                                                    display={"flex"}
                                                    bg={document?.endorsements?.bm_endorsement_provided === true ? "green.500" : "red.500"}
                                                    color={"white"}
                                                >
                                                    {document?.endorsements?.bm_endorsement_provided === true ? "Granted" : "Required"}
                                                </Tag>
                                            )

                                            :
                                            (
                                                <Switch
                                                    defaultChecked={document?.endorsements?.bm_endorsement_provided === true}
                                                    {...register('bmEndorsementProvided', { value: bmEndProvided })}
                                                    isDisabled={!bmEndRequiredValue}
                                                />
                                            )
                                    }
                                </Flex>
                            </Flex>

                        </Grid>


                        {/* Plant Specimen Collection */}
                        <Grid
                            gridTemplateColumns={"repeat(1, 1fr)"}
                            gridRowGap={4}
                            alignItems={"center"}
                            userSelect={"none"}
                            border={"1px solid"}
                            borderColor={"gray.300"}
                            p={4}
                            rounded={"xl"}
                            roundedTop={0}
                            borderTop={0}
                            roundedBottom={0}
                        >
                            {/* <Flex
                                alignItems={"center"}
                                userSelect={"none"}
                            >
                                <Box
                                    flex={1}
                                >
                                    <Text
                                        fontWeight={"semibold"}
                                    >
                                        Plant Specimen Collection
                                    </Text>
                                </Box>

                                <Checkbox
                                    defaultChecked={
                                        involvesPlants === true
                                    }
                                    mr={3}
                                    // isDisabled
                                    {...register('involvesPlants', { value: involvesPlants })}

                                />

                            </Flex> */}


                            {/* {
                            involvesPlantsValue &&
                            ( */}
                            <Flex
                            >
                                <Box
                                    flex={1}
                                >
                                    <Text
                                        // color={involvesPlantsValue ? "black" : "gray.500"}
                                        fontWeight={"semibold"}
                                    >
                                        Herbarium Curator's Endorsement Required?</Text>
                                </Box>
                                <Checkbox
                                    defaultChecked={
                                        hcEndRequired
                                    }
                                    mr={3}
                                    // onChange={handleTogglePlantsInvolved}
                                    {...register('herbariumEndorsementRequired', { value: hcEndRequired })}
                                    isDisabled={!involvesPlantsValue}
                                />


                            </Flex>
                            {/* 

                            )
                        } */}
                            {/* {
                            hcEndReqValue === true && ( */}
                            <Flex
                                alignItems={"center"}
                            >
                                <Box>
                                    <Text
                                        color={hcEndRequired ? "black" : "gray.500"}
                                    >
                                        Herbarium Curator's Endorsement</Text>
                                </Box>
                                <Flex
                                    flex={1}
                                    justifyContent={"flex-end"}
                                >
                                    {!userCanEditHCEndorsement
                                        ?
                                        (
                                            <Tag
                                                alignItems={"center"}
                                                justifyContent={"center"}
                                                display={"flex"}
                                                bg={document?.endorsements?.hc_endorsement_provided === true ? "green.500" : "red.500"}
                                                color={"white"}
                                            >
                                                {document?.endorsements?.hc_endorsement_provided === true ? "Granted" : "Required"}
                                            </Tag>
                                        ) :
                                        (
                                            <Switch
                                                defaultChecked={document?.endorsements?.hc_endorsement_provided === true}
                                                {...register('herbariumEndorsementProvided', { value: hcEndProvided })}
                                                isDisabled={!hcEndReqValue}

                                            />

                                        )}
                                </Flex>
                            </Flex>
                            {/* )
                        } */}
                        </Grid>

                        {/* Interaction with Animals */}
                        <Grid
                            gridTemplateColumns={"repeat(1, 1fr)"}
                            gridRowGap={4}
                            alignItems={"center"}
                            userSelect={"none"}
                            border={"1px solid"}
                            borderColor={"gray.300"}
                            p={4}
                            rounded={"xl"}
                            roundedTop={0}
                            borderTop={0}
                        // roundedBottom={0}
                        >
                            {/* <Flex
                                alignItems={"center"}
                                userSelect={"none"}
                            >
                                <Box
                                    flex={1}
                                >
                                    <Text
                                        fontWeight={"semibold"}
                                    >
                                        Interaction with Vertebrate Animals
                                    </Text>
                                </Box>

                                <Checkbox
                                    defaultChecked={
                                        involvesAnimals
                                    }
                                    mr={3}
                                    // onChange={handleToggleAnimalsInvolved}
                                    {...register('involvesAnimals', { value: involvesAnimals })}
                                />


                            </Flex> */}

                            {/* {involvesAnimalsValue === true &&
                            ( */}
                            <Flex
                                // ml={8}
                                // mt={2}
                                w={"100%"}
                            >
                                <Box
                                    flex={1}
                                >
                                    <Text
                                        fontWeight={"semibold"}

                                    // color={involvesAnimalsValue ? "black" : "gray.500"}
                                    >
                                        Animal Ethics Committee Endorsement Required?
                                    </Text>
                                </Box>
                                <Box
                                    justifySelf={'flex-end'}
                                    // flex={1}
                                    alignItems={'center'}
                                >
                                    <Checkbox
                                        defaultChecked={
                                            aecEndRequired
                                        }
                                        mr={3}
                                        // onChange={handleTogglePlantsInvolved}
                                        {...register('aecEndorsementRequired', { value: aecEndRequired })}
                                        isDisabled={!involvesAnimalsValue}
                                    />

                                </Box>

                            </Flex>
                            {/* 
                            )} */}

                            {/* {
                            aecEndReqValue === true && ( */}
                            <Flex
                                alignItems={"center"}
                                mb={3}
                            // w={"100%"}
                            // ml={8}
                            // mt={2}
                            >
                                <Box
                                    flex={1}

                                >
                                    <Text
                                        color={aecEndReqValue ? "black" : "gray.500"}
                                    >
                                        Animal Ethics Committee's Endorsement
                                    </Text>
                                </Box>
                                <Flex
                                >
                                    {!userCanEditAECEndorsement
                                        ?
                                        (
                                            <Tag
                                                alignItems={"center"}
                                                justifyContent={"center"}
                                                display={"flex"}
                                                bg={document?.endorsements?.ae_endorsement_provided === true ? "green.500" : "red.500"}
                                                color={"white"}
                                            >
                                                {document?.endorsements?.ae_endorsement_provided === true ? "Granted" : "Required"}
                                            </Tag>
                                        ) :
                                        (
                                            <Switch
                                                defaultChecked={document?.endorsements?.ae_endorsement_provided === true}
                                                {...register('aecEndorsementProvided', { value: aecEndProvided })}
                                                isDisabled={!aecEndReqValue}
                                            />

                                        )}
                                </Flex>
                            </Flex>
                            {/* )
                        } */}


                        </Grid>

                        <Flex
                            pt={4}
                            justifyContent={"flex-end"}
                        >
                            <Button
                                // form="submitEndorsement"
                                colorScheme="blue"
                                // type="submit"
                                mx={1}
                                isDisabled={
                                    dmEndReqValue === undefined ||
                                    dmEndProvidedValue === undefined ||
                                    bmEndRequiredValue === undefined ||
                                    bmEndProvidedValue === undefined

                                    ||

                                    hcEndReqValue === undefined ||
                                    hcEndProvidedValue === undefined ||
                                    aecEndReqValue === undefined ||
                                    aecEndProvidedValue === undefined
                                }
                                onClick={onOpen}
                            >
                                Send Emails
                            </Button>
                            <Button
                                mx={1}

                                colorScheme="green"
                                isDisabled={
                                    dmEndReqValue === undefined ||
                                    dmEndProvidedValue === undefined ||
                                    bmEndRequiredValue === undefined ||
                                    bmEndProvidedValue === undefined
                                    ||
                                    hcEndReqValue === undefined ||
                                    hcEndProvidedValue === undefined ||
                                    aecEndReqValue === undefined ||
                                    aecEndProvidedValue === undefined
                                }
                            >
                                Save
                            </Button>
                        </Flex>
                    </Grid>
                </Flex>
            </Box >
        </>


    )
}