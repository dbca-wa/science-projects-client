import {
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  InputGroup,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ISimpleLocationData } from "@/types";

interface Props {
  title: string;
  areas: ISimpleLocationData[];
  area_type: "dbcadistrict" | "dbcaregion" | "ibra" | "imcra" | "nrm";
  selectedAreas: number[];
  setSelectedAreas: React.Dispatch<React.SetStateAction<number[]>>;
}

export const AreaCheckAndMaps = ({
  areas,
  title,
  area_type,
  selectedAreas,
  setSelectedAreas,
}: Props) => {
  // Find the "All" area for this specific area_type
  const allArea = areas.find((area) => {
    return area.name.toLowerCase().startsWith("all ");
  });

  // Track which selections belong to the current area type
  const currentAreaIds = new Set(areas.map((area) => area.pk));

  // Flag to track if "All" is selected for this area type
  const isAllSelected = allArea ? selectedAreas.includes(allArea.pk) : false;

  // Handle checkbox change for any area (All or regular)
  const handleCheckboxChange = (area, isChecked) => {
    console.log(`${area_type} - Checkbox clicked:`, area.name, isChecked);

    // Is this the "All" checkbox?
    const isAllCheckbox = area.name.toLowerCase().startsWith("all ");

    // Get current selections minus any from this area type
    const otherAreaSelections = selectedAreas.filter(
      (id) => !currentAreaIds.has(id),
    );

    if (isAllCheckbox) {
      // Handling the "All" checkbox
      if (isChecked) {
        // Selected "All" - keep other area types and add ONLY the "All" for this area type
        setSelectedAreas([...otherAreaSelections, area.pk]);
      } else {
        // Deselected "All" - just remove it
        setSelectedAreas(otherAreaSelections);
      }
    } else {
      // Handling regular checkboxes
      if (isChecked) {
        // Selected a regular area

        // If "All" was previously selected, remove it
        const selectionsWithoutAll = isAllSelected
          ? selectedAreas.filter((id) => id !== allArea.pk)
          : [...selectedAreas];

        // Add this area
        setSelectedAreas([...selectionsWithoutAll, area.pk]);
      } else {
        // Deselected a regular area - just remove it
        setSelectedAreas(selectedAreas.filter((id) => id !== area.pk));
      }
    }
  };

  return (
    <FormControl mb={4}>
      <FormLabel>{title}</FormLabel>
      <InputGroup>
        <Grid
          gridTemplateColumns={"repeat(3, 1fr)"}
          gridGap={3}
          py={4}
          gridColumnGap={10}
        >
          {areas?.map((area, index) => {
            const isAllCheckbox = area.name.toLowerCase().startsWith("all ");
            const isChecked = selectedAreas.includes(area.pk);
            const isDisabled = isAllSelected && !isAllCheckbox;

            return (
              <Flex key={index}>
                <Checkbox
                  id={`checkbox-${area_type}-${area.pk}`}
                  isChecked={isChecked}
                  isDisabled={isDisabled}
                  onChange={(e) => handleCheckboxChange(area, e.target.checked)}
                >
                  {area.name}
                </Checkbox>
              </Flex>
            );
          })}
        </Grid>
      </InputGroup>
    </FormControl>
  );
};
