// WIP

import { getInternalUsersBasedOnSearchTerm } from "@/lib/api";
import { IUserData } from "@/types";
import {
  Avatar,
  Box,
  Flex,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuTextMatch,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
  TextNode,
} from "lexical";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";

// import "@/styles/mentions.css";

// import { $createMentionNode } from "../../nodes/MentionNode";

const PUNCTUATION =
  "\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%'\"~=<>_:;";
const NAME = "\\b[A-Z][^\\s" + PUNCTUATION + "]";

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const PUNC = DocumentMentionsRegex.PUNCTUATION;

const TRIGGERS = ["@"].join("");

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = "[^" + TRIGGERS + PUNC + "\\s]";

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  "(?:" +
  "\\.[ |$]|" + // E.g. "r. " in "Mr. Smith"
  " |" + // E.g. " " in "Josh Duck"
  "[" +
  PUNC +
  "]|" + // E.g. "-' in "Salier-Hellendag"
  ")";

const LENGTH_LIMIT = 75;

const AtSignMentionsRegex = new RegExp(
  "(^|\\s|\\()(" +
    "[" +
    TRIGGERS +
    "]" +
    "((?:" +
    VALID_CHARS +
    VALID_JOINS +
    "){0," +
    LENGTH_LIMIT +
    "})" +
    ")$"
);

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50;

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  "(^|\\s|\\()(" +
    "[" +
    TRIGGERS +
    "]" +
    "((?:" +
    VALID_CHARS +
    "){0," +
    ALIAS_LENGTH_LIMIT +
    "})" +
    ")$"
);

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5;

const mentionsCache = new Map();

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
  },
  SerializedTextNode
>;

const convertMentionElement = (
  domNode: HTMLElement
): DOMConversionOutput | null => {
  const textContent = domNode.textContent;

  if (textContent !== null) {
    const node = $createMentionNode(textContent);
    return {
      node,
    };
  }

  return null;
};
// const mentionStyle = "background-color: rgba(24, 119, 232, 0.2)";

const mentionStyle = {
  // color: "orange",
  backgroundColor: "rgba(24, 119, 232, 0.2)",
  paddingLeft: "5px",
  paddingRight: "5px",
  borderRadius: "5px",
};
// 13, 180, 185
export class MentionNode extends TextNode {
  __mention: string;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__text, node.__key);
  }
  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.mentionName);
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(mentionName: string, text?: string, key?: NodeKey) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      type: "mention",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    Object.assign(dom.style, mentionStyle);
    // dom.style.cssText = mentionStyle;
    dom.className = "mention";
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-mention", "true");
    element.textContent = this.__text;
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-mention")) {
          return null;
        }
        return {
          conversion: convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

export const $createMentionNode = (mentionName: string): MentionNode => {
  const mentionNode = new MentionNode(mentionName);
  mentionNode.setMode("segmented").toggleDirectionless();
  return $applyNodeReplacement(mentionNode);
};

export const $isMentionNode = (
  node: LexicalNode | null | undefined
): node is MentionNode => {
  return node instanceof MentionNode;
};

// =================== ABOVE IS MENTION NODE, PRIMARILY FROM LEXICAL.DEV ======================================

const realLookupService = {
  search(string: string, callback: (results: Array<IUserData>) => void): void {
    setTimeout(() => {
      getInternalUsersBasedOnSearchTerm(string, true)
        .then((data) => {
          console.log(data.users);
          // setFilteredItems(data.users);
          callback(data.users);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
          // setFilteredItems([]);
        });
    }, 500);
  },
};

const useMentionLookupService = (mentionString: string | null) => {
  const [results, setResults] = useState<Array<IUserData>>([]);

  useEffect(() => {
    const cachedResults = mentionsCache.get(mentionString);

    if (mentionString == null) {
      setResults([]);
      return;
    }

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    mentionsCache.set(mentionString, null);
    realLookupService.search(mentionString, (newResults) => {
      mentionsCache.set(mentionString, newResults);
      setResults(newResults);
    });
  }, [mentionString]);

  return results;
};

const checkForAtSignMentions = (
  text: string,
  minMatchLength: number
): MenuTextMatch | null => {
  let match = AtSignMentionsRegex.exec(text);

  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text);
  }
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[3];
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      };
    }
  }
  return null;
};

const getPossibleQueryMatch = (text: string): MenuTextMatch | null => {
  return checkForAtSignMentions(text, 1);
};

// =================== ABOVE IS FILTER USER LOGIC ======================================

class CustomMentionTypeheadOption extends MenuOption {
  user: IUserData;

  constructor(user: IUserData) {
    super(`${user.first_name} ${user.last_name}`);
    this.user = user;
  }
  // name: string;
  // picture: JSX.Element;
  // pk: number;

  // constructor(name: string, picture: JSX.Element, pk: number) {
  //   super(name);
  //   this.name = name;
  //   this.picture = picture;
  //   this.pk = pk;
  // }
}

interface CustomMentionsTypeheadMenuItemProps {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: CustomMentionTypeheadOption;
  optionLength: number;
}

const CustomMentionsTypeheadMenuItem = ({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
  optionLength,
}: CustomMentionsTypeheadMenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ListItem
      key={option.key}
      margin={0}
      minWidth={"180px"}
      fontSize={"14px"}
      outline={"none"}
      cursor={"pointer"}
      borderRadius={
        index === 1
          ? "8px 8px 0px 0px"
          : index === optionLength
          ? "0px 0px 8px 8px"
          : "8px"
      }
      border={0}
      backgroundColor={"#fff"}
      flexShrink={0}
      flexDirection={"row"}
      alignContent={"center"}
      display={"flex"}
      zIndex={999999999}
      tabIndex={-1}
      role="option"
      aria-selected={isSelected}
      id={`typehead-item-${index}`}
      ref={option.setRefElement}
    >
      {/* <CustomMenuItem user={option.user} onClick={onClick} />
       */}
      <Flex
        as="button"
        type="button"
        w="100%"
        textAlign="left"
        p={2}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
        bg={isHovered ? "gray.200" : "transparent"}
        alignItems="center"
        // {...rest}
      >
        <Avatar
          src={
            option.user?.image?.file
              ? option.user.image.file
              : option.user?.image?.old_file
              ? option.user.image.old_file
              : undefined
          }
          h={"30px"}
          w={"30px"}
        />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="start"
          ml={3}
          h="100%"
        >
          <Text
            ml={2}
            color={
              option.user.is_staff
                ? option.user.is_superuser
                  ? "blue.500"
                  : "green.500"
                : "gray.500"
            }
          >
            {`${
              option.user.first_name === "None"
                ? option.user.username
                : option.user.first_name
            } ${
              option.user.last_name === "None" ? "" : option.user.last_name
            } ${
              option.user.is_staff
                ? option.user.is_superuser
                  ? "(Admin)"
                  : "(Staff)"
                : "(External)"
            }`}
          </Text>
        </Box>
      </Flex>
    </ListItem>
  );
};

{
  /* <CustomMenuItem onClick={() => console.log(option)} user={option} /> */
}

// interface CustomMenuItemProps extends FlexProps {
//   onClick: () => void;
//   user: IUserData;
// }

// const CustomMenuItem = ({ onClick, user, ...rest }: CustomMenuItemProps) => {
//   const [isHovered, setIsHovered] = useState(false);

//   const handleClick = () => {
//     onClick();
//   };

//   return (
//     <Flex
//       as="button"
//       type="button"
//       w="100%"
//       textAlign="left"
//       p={2}
//       onClick={handleClick}
//       onMouseOver={() => setIsHovered(true)}
//       onMouseOut={() => setIsHovered(false)}
//       bg={isHovered ? "gray.200" : "transparent"}
//       alignItems="center"
//       {...rest}
//     >
//       <Avatar
//         src={
//           user?.image?.file
//             ? user.image.file
//             : user?.image?.old_file
//             ? user.image.old_file
//             : undefined
//         }
//         h={"30px"}
//         w={"30px"}
//       />
//       <Box
//         display="flex"
//         alignItems="center"
//         justifyContent="start"
//         ml={3}
//         h="100%"
//       >
//         <Text
//           ml={2}
//           color={
//             user.is_staff
//               ? user.is_superuser
//                 ? "blue.500"
//                 : "green.500"
//               : "gray.500"
//           }
//         >
//           {`${user.first_name === "None" ? user.username : user.first_name} ${
//             user.last_name === "None" ? "" : user.last_name
//           } ${
//             user.is_staff
//               ? user.is_superuser
//                 ? "(Admin)"
//                 : "(Staff)"
//               : "(External)"
//           }`}
//         </Text>
//       </Box>
//     </Flex>
//   );
// };

export default function NewMentionsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const results = useMentionLookupService(queryString);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(
    () =>
      results
        .map(
          (result) =>
            // <p>ji</p>
            new CustomMentionTypeheadOption(
              result
              // `${result?.first_name} ${result?.last_name}`,
              // <i className="icon user" />
            )
          // <CustomMenuItem
          //   user={result}
          //   onClick={() => console.log(result?.first_name)}
          // />
        )
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results]
  );

  const onSelectOption = useCallback(
    (
      selectedOption: CustomMentionTypeheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(selectedOption.user.first_name);
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        mentionNode.select();
        closeMenu();
      });
    },
    [editor]
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      if (slashMatch !== null) {
        return null;
      }
      return getPossibleQueryMatch(text);
    },
    [checkForSlashTriggerMatch, editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<CustomMentionTypeheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && results.length
          ? ReactDOM.createPortal(
              <Box
                // className="typeahead-popover mentions-menu"
                background={"#fff"}
                w={"250px"}
                boxShadow={"0px 5px 10px rgba(0, 0, 0, 0.3)"}
                borderRadius={"8px"}
                // position={"fixed"}
                zIndex={999999999}
                // pos={"fixed"}
                // top={0}
                // left={0}
                position="absolute"
                top={`${anchorElementRef.current.offsetHeight - 15}px`}
                left={`${anchorElementRef.current.offsetWidth - 17.5}px`}
              >
                <UnorderedList
                  css={{
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                    listStyle: "none",
                    "::-webkit-scrollbar": {
                      display: "none",
                    },
                  }}
                  padding={0}
                  margin={0}
                  borderRadius={"8px"}
                  maxH={"200px"}
                  zIndex={999999999}
                  overflowY={"scroll"}
                >
                  {options.map((option, i: number) => (
                    <CustomMentionsTypeheadMenuItem
                      key={option.key}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i);
                      }}
                      index={i}
                      option={option}
                      optionLength={options.length}
                    />
                  ))}
                </UnorderedList>
              </Box>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
}

// function MentionsTypeaheadMenuItem({
//   index,
//   isSelected,
//   onClick,
//   onMouseEnter,
//   option,
// }: {
//   index: number;
//   isSelected: boolean;
//   onClick: () => void;
//   onMouseEnter: () => void;
//   option: MentionTypeaheadOption;
// }) {
//   let className = "item";
//   if (isSelected) {
//     className += " selected";
//   }
//   return (
//     <li
//       key={option.key}
//       tabIndex={-1}
//       className={className}
//       ref={option.setRefElement}
//       role="option"
//       aria-selected={isSelected}
//       id={"typeahead-item-" + index}
//       onMouseEnter={onMouseEnter}
//       onClick={onClick}
//     >
//       {option.picture}
//       <span className="text">{option.name}</span>
//     </li>
//   );
// }
