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
  $createTextNode,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    ")$",
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
    ")$",
);

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5;

const mentionsCache = new Map();

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    userId: number;
    userEmail: string;
    userName: string;
  },
  SerializedTextNode
>;

const convertMentionElement = (
  domNode: HTMLElement,
): DOMConversionOutput | null => {
  const textContent = domNode.textContent;
  const userId = parseInt(domNode.getAttribute("data-user-id") || "0", 10);
  const userEmail = domNode.getAttribute("data-user-email") || "";
  const userName = domNode.getAttribute("data-user-name") || "";

  if (textContent !== null) {
    const node = $createMentionNode(textContent, userId, userEmail, userName);
    return {
      node,
    };
  }

  return null;
};

// const mentionStyle = {
//   backgroundColor: "rgba(24, 119, 232, 0.2)",
//   paddingLeft: "5px",
//   paddingRight: "5px",
//   borderRadius: "5px",
// };

const mentionStyle = {
  backgroundColor: "rgba(24, 119, 232, 0.2)",
  paddingLeft: "5px",
  paddingRight: "5px",
  borderRadius: "5px",
  color: "#1877e8", // Add a distinct color for mentions
  fontWeight: "500", // Make mentions slightly bolder
};

export class MentionNode extends TextNode {
  __mention: string;
  __userId: number;
  __userEmail: string;
  __userName: string;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(
      node.__mention,
      node.__userId,
      node.__userEmail,
      node.__userName,
      node.__text,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(
      serializedNode.mentionName,
      serializedNode.userId,
      serializedNode.userEmail,
      serializedNode.userName,
    );
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(
    mentionName: string,
    userId: number = 0,
    userEmail: string = "",
    userName: string = "",
    text?: string,
    key?: NodeKey,
  ) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
    this.__userId = userId;
    this.__userEmail = userEmail;
    this.__userName = userName;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      userId: this.__userId,
      userEmail: this.__userEmail,
      userName: this.__userName,
      type: "mention",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);

    // Apply styling
    Object.assign(dom.style, mentionStyle);

    // Add classes and data attributes
    dom.className = "mention";

    // These attributes need to be more persistent for sanitization
    dom.setAttribute("data-user-id", String(this.__userId));
    dom.setAttribute("data-user-email", this.__userEmail);
    dom.setAttribute("data-user-name", this.__userName);

    // Add extra attribute for mention detection that's less likely to be sanitized
    dom.setAttribute("data-lexical-mention", "true");

    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-mention", "true");
    element.setAttribute("data-user-id", String(this.__userId));
    element.setAttribute("data-user-email", this.__userEmail);
    element.setAttribute("data-user-name", this.__userName);
    element.textContent = this.__text;
    return { element };
  }

  getUserName(): string {
    return this.__userName;
  }
}

export const $createMentionNode = (
  mentionName: string,
  userId: number = 0,
  userEmail: string = "",
  userName: string = "",
): MentionNode => {
  const mentionNode = new MentionNode(mentionName, userId, userEmail, userName);
  mentionNode.setMode("segmented").toggleDirectionless();
  return $applyNodeReplacement(mentionNode);
};

export const $isMentionNode = (
  node: LexicalNode | null | undefined,
): node is MentionNode => {
  return node instanceof MentionNode;
};
// =================== ABOVE IS MENTION NODE, PRIMARILY FROM LEXICAL.DEV ======================================

const realLookupService = {
  search(
    string: string,
    projectPk: number,
    callback: (results: Array<IUserData>) => void,
  ): void {
    setTimeout(() => {
      getInternalUsersBasedOnSearchTerm(string, true, projectPk)
        .then((data) => {
          // console.log(data.users);
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

const useMentionLookupService = (
  mentionString: string | null,
  projectPk: number,
) => {
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
    realLookupService.search(mentionString, projectPk, (newResults) => {
      mentionsCache.set(mentionString, newResults);
      setResults(newResults);
    });
  }, [mentionString]);

  return results;
};

const checkForAtSignMentions = (
  text: string,
  minMatchLength: number,
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
        bg={isSelected ? "gray.200" : isHovered ? "gray.100" : "transparent"}
        alignItems="center"
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
            fontWeight={isSelected ? "medium" : "normal"}
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

// Store mentioned users to track who needs to be notified
export const mentionedUsers = new Set<{ id: number; email: string }>();

// Helper function to extract mentioned users from HTML
export const extractMentionedUsers = (
  html: string,
): Array<{ id: number; email: string; name: string }> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Look for spans with data-user-id attribute (more reliable than class)
  const mentionSpans = doc.querySelectorAll("span[data-user-id]");

  // console.log("Found mention spans:", mentionSpans.length);

  // Fallback: Look for spans that contain text starting with @
  if (mentionSpans.length === 0) {
    const allSpans = doc.querySelectorAll("span");
    const atMentionSpans = Array.from(allSpans).filter((span) =>
      span.textContent?.trim().startsWith("@"),
    );
    console.log("Fallback @ spans:", atMentionSpans.length);
  }

  const users: Array<{ id: number; email: string; name: string }> = [];

  mentionSpans.forEach((span) => {
    const userId = parseInt(span.getAttribute("data-user-id") || "0", 10);
    const userEmail = span.getAttribute("data-user-email") || "";
    const userName = span.getAttribute("data-user-name") || "";

    console.log("Found mention:", { userId, userEmail, userName });

    if (userId && userEmail) {
      users.push({ id: userId, email: userEmail, name: userName });
    }
  });

  console.log("Extracted users:", users);
  return users;
};

export default function NewMentionsPlugin({
  projectPk,
}: {
  projectPk: number;
}): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const results = useMentionLookupService(queryString, projectPk);
  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(
    () =>
      results
        .map((result) => new CustomMentionTypeheadOption(result))
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results],
  );

  const onSelectOption = useCallback(
    (
      selectedOption: CustomMentionTypeheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const user = selectedOption.user;
        const displayName =
          user.first_name === "None"
            ? user.username
            : `${user.first_name} ${user.last_name === "None" ? "" : user.last_name}`;

        const userId = user.pk || 0;
        const userEmail = user.email || "";
        const userName =
          `${user.first_name} ${user.last_name}`.trim() || user.username || "";

        // Add @ symbol to the display text
        const mentionDisplayText = `@${displayName}`;

        const mentionNode = $createMentionNode(
          mentionDisplayText,
          userId,
          userEmail,
          userName,
        );
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        mentionNode.select();

        // Insert a space after the mention
        const spaceNode = $createTextNode(" ");
        mentionNode.insertAfter(spaceNode);

        // Place the selection after the space
        spaceNode.select();

        closeMenu();
      });
    },
    [editor],
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      if (slashMatch !== null) {
        return null;
      }
      return getPossibleQueryMatch(text);
    },
    [checkForSlashTriggerMatch, editor],
  );

  // We'll use a ref instead of state to avoid re-render cycles
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Use a ref to track initialization rather than state
  const hasInitializedRef = useRef(false);

  return (
    <LexicalTypeaheadMenuPlugin<CustomMentionTypeheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) =>
        anchorElementRef.current && results.length
          ? ReactDOM.createPortal(
              <Box
                background={"#fff"}
                w={"250px"}
                boxShadow={"0px 5px 10px rgba(0, 0, 0, 0.3)"}
                borderRadius={"8px"}
                zIndex={999999999}
                position="absolute"
                top={`${anchorElementRef.current.offsetHeight - 15}px`}
                left={`${anchorElementRef.current.offsetWidth - 17.5}px`}
                onKeyDown={(e) => {
                  // Handle keyboard navigation
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const nextIndex =
                      selectedIndex === options.length - 1
                        ? 0
                        : selectedIndex + 1;
                    setHighlightedIndex(nextIndex);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prevIndex =
                      selectedIndex === 0
                        ? options.length - 1
                        : selectedIndex - 1;
                    setHighlightedIndex(prevIndex);
                  } else if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault();
                    selectOptionAndCleanUp(options[selectedIndex]);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    // Close the menu
                    setQueryString(null);
                  }
                }}
                tabIndex={0} // Make the box focusable
                ref={(element) => {
                  // Store the element reference
                  dropdownRef.current = element;

                  // Focus only once when first created
                  if (element && !hasInitializedRef.current) {
                    // Try to focus after a brief delay to ensure DOM is ready
                    setTimeout(() => {
                      if (element) {
                        element.focus();
                        hasInitializedRef.current = true;
                      }
                    }, 50);
                  }
                }}
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
              anchorElementRef.current,
            )
          : null
      }
    />
  );
}
