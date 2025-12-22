// The basic rich text editor component; does not allow sticky notes, emotes, etc.

import { Label } from "@/shared/components/ui/label";
import { useColorMode } from "@/shared/utils/theme.utils";

import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode } from "@lexical/rich-text";
import { SimpleStatefulRTE } from "./Sections/SimpleStatefulRTE";
import { SimpleStatefulPlainTE } from "./Sections/SimpleStatefulPlainTE";

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
  isPlain?: boolean;
  buttonSize?: "sm" | "md" | "lg";
  tabbable?: boolean;
  hideBold?: boolean;
  hideUnderline?: boolean;
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
  isPlain,
  buttonSize,
  tabbable,
  hideBold,
  hideUnderline,
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
        italic:
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
    <div className={`pb-2 w-full z-[2] ${isRequired ? 'required' : ''}`}>
      {showTitle ? (
        <Label className="mb-3 ml-2">
          {title}
        </Label>
      ) : null}
      <div className="relative">
        <div className={`relative w-full rounded-[20px] shadow-[rgba(100,100,111,0.1)_0px_7px_29px_0px] z-[2] ${
          colorMode === "light" ? "bg-white/60" : "bg-black/50"
        }`}>
          {isPlain ? (
            <SimpleStatefulPlainTE
              allowInsertButton={allowInsertButton}
              placeholderText={placeholder}
              showToolbar={showToolbar}
              initialConfig={initialConfig}
              value={value}
              setValueAsPlainText={setValueAsPlainText}
              setValueFunction={setValueFunction}
              shouldFocus={shouldFocus ? shouldFocus : undefined}
              tabbable={tabbable ? tabbable : undefined}
            />
          ) : (
            <SimpleStatefulRTE
              allowInsertButton={allowInsertButton}
              placeholderText={placeholder}
              showToolbar={showToolbar}
              initialConfig={initialConfig}
              value={value}
              setValueAsPlainText={setValueAsPlainText}
              setValueFunction={setValueFunction}
              shouldFocus={shouldFocus ? shouldFocus : undefined}
              buttonSize={buttonSize}
              tabbable={tabbable ? tabbable : undefined}
              hideBold={hideBold}
              hideUnderline={hideUnderline}
            />
          )}
        </div>
      </div>
      {helperText ? (
        <p className={`ml-2 text-sm text-muted-foreground ${helperTextColor ? `text-[${helperTextColor}]` : ''}`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
