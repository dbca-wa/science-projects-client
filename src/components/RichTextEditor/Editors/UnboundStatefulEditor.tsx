// The basic rich text editor component; does not allow sticky notes, emotes, etc.

import {
  Box,
  useColorMode,
  FormLabel,
  FormControl,
  InputGroup,
  FormHelperText,
} from "@chakra-ui/react";

import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode } from "@lexical/rich-text";
import { SimpleStatefulRTE } from "./Sections/SimpleStatefulRTE";

interface IProps {
  // data: string;
  title: string;
  showTitle: boolean;
  setValueAsPlainText: boolean;
  helperText?: string;
  showToolbar: boolean;
  isRequired: boolean;
  placeholder?: string;
  value: string;
  setValueFunction: React.Dispatch<React.SetStateAction<string>>;
  allowInsertButton?: boolean;
  shouldFocus?: boolean;
  helperTextColor?: string;
}

export const UnboundStatefulEditor = ({
  value,
  setValueFunction,
  setValueAsPlainText,
  showToolbar,
  title,
  helperText,
  showTitle,
  isRequired,
  placeholder,
  allowInsertButton,
  shouldFocus,
  helperTextColor,
}: IProps) => {
  const { colorMode } = useColorMode();

  const generateTheme = (colorMode) => {
    return {
      quote: "editor-quote",
      ltr: "ltr",
      rtl: "rtl",
      paragraph: colorMode === "light" ? "editor-p-light" : "editor-p-dark",
      span: colorMode === "light" ? "editor-p-light" : "editor-p-dark",
      heading: {
        h1: colorMode === "light" ? "editor-h1-light" : "editor-h1-dark",
        h2: colorMode === "light" ? "editor-h2-light" : "editor-h2-dark",
        h3: colorMode === "light" ? "editor-h3-light" : "editor-h3-dark",
      },
      list: {
        ul: colorMode === "light" ? "editor-ul-light" : "editor-ul-dark",
        ol: colorMode === "light" ? "editor-ol-light" : "editor-ol-dark",
        listitem: colorMode === "light" ? "editor-li-light" : "editor-li-dark",
        listitemChecked: "editor-listItemChecked",
        listitemUnchecked: "editor-listItemUnchecked",
      },
      text: {
        bold: colorMode === "light" ? "editor-bold-light" : "editor-bold-dark",
        italics:
          colorMode === "light"
            ? "editor-italics-light"
            : "editor-italics-dark",
        underline:
          colorMode === "light"
            ? "editor-underline-light"
            : "editor-underline-dark",
        strikethrough:
          colorMode === "light"
            ? "editor-textStrikethrough-light"
            : "editor-textStrikethrough-dark",
        subscript:
          colorMode === "light"
            ? "editor-textSubscript-light"
            : "editor-textSubscript-dark",
        underlineStrikethrough:
          colorMode === "light"
            ? "editor-textUnderlineStrikethrough-light"
            : "editor-textUnderlineStrikethrough-dark",
      },
    };
  };

  // Generate the theme based on the current colorMode
  const theme = generateTheme(colorMode);

  // Catch errors that occur during Lexical updates
  const onError = (error: Error) => {
    console.log(error);
  };

  const initialConfig = {
    namespace: "Stateful Rich Text Editor",
    editable: true,
    theme,
    onError,
    nodes: [ListNode, ListItemNode, HeadingNode],
  };

  return (
    <FormControl isRequired={isRequired} pb={2} w={"100%"} zIndex={2}>
      {showTitle ? (
        <FormLabel mb={3} ml={2}>
          {title}
        </FormLabel>
      ) : null}
      <InputGroup>
        <Box
          pos={"relative"}
          w={"100%"}
          rounded={20}
          //   boxShadow={"rgba(100, 100, 111, 0.1) 0px 7px 29px 0px"}
          boxShadow={"rgba(100, 100, 111, 0.1) 0px 7px 29px 0px"}
          bg={colorMode === "light" ? "whiteAlpha.600" : "blackAlpha.500"}
          zIndex={2}
        >
          <SimpleStatefulRTE
            allowInsertButton={allowInsertButton}
            placeholderText={placeholder}
            showToolbar={showToolbar}
            initialConfig={initialConfig}
            value={value}
            setValueAsPlainText={setValueAsPlainText}
            setValueFunction={setValueFunction}
            shouldFocus={shouldFocus ? shouldFocus : undefined}
          />
        </Box>
      </InputGroup>
      {helperText ? (
        <FormHelperText ml={2} color={helperTextColor ?? helperTextColor}>
          {helperText}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
};
