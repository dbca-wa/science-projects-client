// A template for a RTE simple button - props fill out its icon, text and functionality

import { Box, Center, Grid, Text, useColorMode } from "@chakra-ui/react";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { INSERT_LINE_BREAK_COMMAND, LexicalEditor } from "lexical";
import { useState } from "react";
import { FaTable } from "react-icons/fa";
import "../../../styles/texteditor.css";
import { BaseToolbarMenuButton } from "./BaseToolbarMenuButton";

interface TableGridProps {
    activeEditor: LexicalEditor
}

const TableGrid = ({ activeEditor }: TableGridProps) => {
    const [tableRows, setTableRows] = useState(0);
    const [tableColumns, setTableColumns] = useState(0);
    // const [isDisabled, setIsDisabled] = useState(true);

    const onGridClick = () => {
        const columns: string = String(tableColumns);
        const rows: string = String(tableRows);

        activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
            columns,
            rows,
        });
        activeEditor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, null);
    };

    // useEffect(() => {
    //     if (tableRows && tableRows > 0 && tableRows <= 11 && tableColumns && tableColumns > 0 && tableColumns <= 7) {
    //         setIsDisabled(false);
    //     } else {
    //         setIsDisabled(true);
    //     }
    // }, [tableRows, tableColumns]);

    const { colorMode } = useColorMode();

    const handleMouseEnter = (row: number, column: number) => {
        setTableRows(row + 1);
        setTableColumns(column + 1);
    };

    const createGrid = () => {
        const rows = 11; // Define the maximum rows
        const columns = 7; // Define the maximum columns
        const grid = [];

        for (let row = 0; row < rows; row++) {
            const cols = [];
            for (let col = 0; col < columns; col++) {
                const isHighlighted = row < tableRows && col < tableColumns;
                const isFirstRowOrColumn = row === 0 || col === 0;
                cols.push(
                    <Box
                        key={`${row}-${col}`}
                        w="25px"
                        h="25px"
                        border="1px solid"
                        borderColor={colorMode === "light" ? "gray.300" : "gray.400"}
                        onMouseEnter={() => handleMouseEnter(row, col)}
                        onClick={onGridClick}
                        // backgroundColor={row < tableRows && col < tableColumns ? 'blue.300' : 'white'}
                        backgroundColor={
                            colorMode === "light" ?
                                isFirstRowOrColumn
                                    ? isHighlighted
                                        ? 'blue.300'
                                        : 'gray.200'
                                    : isHighlighted
                                        ? 'blue.200'
                                        : 'white'
                                :
                                isFirstRowOrColumn
                                    ? isHighlighted
                                        ? 'blue.400'
                                        : 'gray.300'
                                    : isHighlighted
                                        ? 'blue.300'
                                        : 'white'

                        }
                        _hover={{
                            backgroundColor: colorMode === "light" ?
                                isFirstRowOrColumn ? 'blue.400' : 'green.100' :
                                isFirstRowOrColumn ? 'blue.500' : 'green.200'
                            ,
                        }}

                    />
                );
            }
            grid.push(
                <Grid templateColumns={`repeat(${columns}, 1fr)`} key={row}>
                    {cols}
                </Grid>
            );
        }
        return grid;
    };

    return (
        <Center
            display={"flex"}
            flexDir={"column"}
            w={"100%"}

        >
            {/* Table amount */}
            <Text
                fontSize={"large"}
                pb={2}
            >
                {tableColumns} x {tableRows} table
            </Text>
            {/* Table grid */}
            <Box
            // display={"flex"}
            // flexDir={"column"}
            // w={"100%"}
            >
                {createGrid()}
            </Box>
        </Center>
    )
}

export const TableDropdown = (
    {
        activeEditor,
    }: TableGridProps) => {
    return (
        <BaseToolbarMenuButton
            menuIcon={FaTable}
            disableHoverBackground
            title="Table"
            menuItems={[
                {
                    component: <TableGrid
                        activeEditor={activeEditor}
                    />,
                },
            ]}
        >
        </BaseToolbarMenuButton>
    )
};
