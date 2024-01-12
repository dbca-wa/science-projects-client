import {
  FORMAT_TEXT_COMMAND,
  INSERT_LINE_BREAK_COMMAND,
  LexicalEditor,
} from "lexical";
import { useEffect, useState } from "react";
import {
  $createTableNodeWithDimensions,
  INSERT_TABLE_COMMAND,
  TableNode,
} from "@lexical/table";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
} from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  activeEditor: LexicalEditor;
  onClose: () => void;
}

export const InsertTableModal = ({ isOpen, activeEditor, onClose }: Props) => {
  const [rows, setRows] = useState("5");
  const [columns, setColumns] = useState("5");
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    const row = Number(rows);
    const column = Number(columns);
    if (row && row > 0 && row <= 50 && column && column > 0 && column <= 25) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [rows, columns]);

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      rows,
    });
    activeEditor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, null);

    onClose();
  };

  const { colorMode } = useColorMode();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={"md"}
      // isCentered={true}
    >
      {" "}
      <ModalOverlay />
      <ModalContent bg={colorMode === "light" ? "white" : "gray.800"} p={4}>
        <ModalHeader mt={5}>Insert Table</ModalHeader>
        <ModalCloseButton />
        <ModalBody mb={5}>
          <Grid gridRowGap={4}>
            <FormControl>
              <FormLabel>Rows</FormLabel>
              <InputGroup>
                <Input
                  placeholder={"# of rows (1-50)"}
                  //   label="Rows"
                  onChange={(e) => setRows(e.target.value)}
                  value={rows}
                  data-test-id="table-modal-rows"
                  type="number"
                />
              </InputGroup>
              <FormHelperText>
                Enter the number of rows for the table
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Columns</FormLabel>
              <InputGroup>
                <Input
                  placeholder={"# of columns (1-25)"}
                  //   label="Columns"
                  onChange={(e) => setColumns(e.target.value)}
                  value={columns}
                  data-test-id="table-modal-columns"
                  type="number"
                />
              </InputGroup>
              <FormHelperText>
                Enter the number of columns for the table
              </FormHelperText>
            </FormControl>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Flex>
            <Button onClick={onClose} mr={3} colorScheme={"gray"}>
              Cancel
            </Button>
            <Button
              disabled={isDisabled}
              onClick={onClick}
              color={"white"}
              background={colorMode === "light" ? "green.500" : "green.600"}
              _hover={{
                background: colorMode === "light" ? "green.400" : "green.500",
              }}
            >
              Confirm
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
