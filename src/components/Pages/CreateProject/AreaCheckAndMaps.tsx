// Maps out the areas to checkboxes which when clicked update a parent state (see params)

import { FormControl, Grid, FormLabel, InputGroup, Flex, Checkbox, Text } from "@chakra-ui/react";
import { ISimpleLocationData } from "../../../types";
import { useEffect, useState } from "react";

interface Props {
    title: string;
    areas: ISimpleLocationData[];
    required: boolean;
    selectedAreas: number[];
    setSelectedAreas: React.Dispatch<React.SetStateAction<number[]>>;
}

export const AreaCheckAndMaps = ({
    areas,
    title,
    required = false,
    selectedAreas,
    setSelectedAreas
}: Props) => {
    const [allAreaChecked, setAllAreaChecked] = useState(false);

    useEffect(() => {
        // Check if the "All " checkbox is checked
        console.log(selectedAreas)
        const isAllAreaChecked = areas.some((area) => {
            return area.name.toLowerCase().startsWith("all ") && selectedAreas.includes(area.pk);
        });
        setAllAreaChecked(isAllAreaChecked);
    }, [areas, selectedAreas]);

    const disableAndUncheckAllOtherRegionsExceptAll = (
        areaId: number,
        isChecked: boolean
    ) => {
        if (isChecked) {
            if (areas.find((area) => area.pk === areaId)) {
                setAllAreaChecked(true);
                setSelectedAreas([areaId]);
            }
        } else {
            setAllAreaChecked(false);
            const newSelectedAreas = selectedAreas.filter((value) => value !== areaId);
            setSelectedAreas(newSelectedAreas);
        }
    };

    return (
        <FormControl isRequired={required} mb={4}>
            <FormLabel>{title}</FormLabel>
            <InputGroup>
                <Grid gridTemplateColumns={"repeat(3, 1fr)"} gridGap={3} py={4}>
                    {areas?.map((area, index) => {
                        const isChecked = selectedAreas.includes(area.pk);
                        const isDisabled =
                            allAreaChecked && !area.name.toLowerCase().startsWith("all ");
                        if (isDisabled && isChecked) {
                            setSelectedAreas((prev) => prev.filter((value) => value !== area.pk));
                        }
                        return (
                            <Flex key={index}>
                                <Checkbox
                                    onChange={(e) => {
                                        if (e.target.name.includes("All ")) {
                                            disableAndUncheckAllOtherRegionsExceptAll(
                                                area.pk,
                                                e.target.checked
                                            );
                                        } else {
                                            setSelectedAreas((prevAreas) =>
                                                e.target.checked
                                                    ? [...prevAreas, area.pk]
                                                    : prevAreas.filter((value) => value !== area.pk)
                                            );
                                        }
                                    }}
                                    isChecked={isChecked}
                                    isDisabled={isDisabled}
                                >{area["name"]}</Checkbox>
                            </Flex>
                        );
                    })}
                </Grid>
            </InputGroup>
        </FormControl>
    );
};