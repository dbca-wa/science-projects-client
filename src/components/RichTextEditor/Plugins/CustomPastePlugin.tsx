import {
  BaseSelection,
  CommandPayloadType,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
  TextNode,
} from "lexical";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";

import { $getListDepth, $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $INTERNAL_isPointSelection,
  $createTabNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  $parseSerializedNode,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  PASTE_COMMAND,
  createCommand,
} from "lexical";

import { useEffect } from "react";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useColorMode } from "@chakra-ui/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

export interface BaseSerializedNode {
  children?: Array<BaseSerializedNode>;
  type: string;
  version: number;
}
export const CSS_TO_STYLES: Map<string, Record<string, string>> = new Map();

export function $addNodeStyle(node: TextNode): void {
  const CSSText = node.getStyle();
  const styles = getStyleObjectFromRawCSS(CSSText);
  CSS_TO_STYLES.set(CSSText, styles);
}

export function getStyleObjectFromRawCSS(css: string): Record<string, string> {
  const styleObject: Record<string, string> = {};
  const styles = css.split(";");

  for (const style of styles) {
    if (style !== "") {
      const [key, value] = style.split(/:([^]+)/); // split on first colon
      if (key && value) {
        styleObject[key.trim()] = value.trim();
      }
    }
  }

  return styleObject;
}

export function $generateNodesFromSerializedNodes(
  serializedNodes: Array<BaseSerializedNode>
): Array<LexicalNode> {
  const nodes = [];
  for (let i = 0; i < serializedNodes.length; i++) {
    const serializedNode = serializedNodes[i];
    const node = $parseSerializedNode(serializedNode);
    if ($isTextNode(node)) {
      $addNodeStyle(node);
    }
    nodes.push(node);
  }
  return nodes;
}

export const SELECTION_INSERT_CLIPBOARD_NODES_COMMAND: LexicalCommand<{
  nodes: Array<LexicalNode>;
  selection: BaseSelection;
}> = createCommand("SELECTION_INSERT_CLIPBOARD_NODES_COMMAND");

export function $insertGeneratedNodes(
  editor: LexicalEditor,
  nodes: Array<LexicalNode>,
  selection: BaseSelection
): void {
  if (
    !editor.dispatchCommand(SELECTION_INSERT_CLIPBOARD_NODES_COMMAND, {
      nodes,
      selection,
    })
  ) {
    selection.insertNodes(nodes);
  }
  return;
}

const convertFirstLevel = (text: string) => {
  // 1 (DONE). FIND ROGUE LIS AND ADD THEM TO THE PREVIOUS UL ELEMENT
  const moveRogueLisToLastULStage1 = (text: string) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(text, "text/html");

    // Collect a list of rogue lis
    const orphanedLiTags = Array.from(dom.querySelectorAll("li")).filter(
      (li) => {
        if (!li.parentElement || li.parentElement.tagName !== "UL") {
          return li;
        }
      }
    );

    // One by one,
    orphanedLiTags.forEach((rogue, rogueIndex) => {
      // make a copy of the rogue li
      const rogueClone = rogue.cloneNode(true) as HTMLElement;
      // add that copy to the last ul found in the dom before the rogue li
      let lastUl: HTMLElement | null = null;
      let prevSibling = rogue.previousElementSibling as HTMLElement;
      while (prevSibling) {
        if (prevSibling && prevSibling.tagName === "UL") {
          lastUl = prevSibling;
          break;
        } else if (prevSibling.tagName === "LI") {
          prevSibling = prevSibling.previousElementSibling as HTMLElement;
        } else {
          prevSibling = null;
          break;
        }
      }

      if (lastUl) {
        // Append the cloned rogue li to the last ul
        lastUl.appendChild(rogueClone);

        // Remove the original rogue li
        rogue.remove();
      }
    });

    return dom.body.innerHTML;
  };
  let updatedDomString = moveRogueLisToLastULStage1(text);
  // console.log("AFTER STEP 1:", updatedDomString);

  // 2 (DONE). FIND ANY ROGUE LIS (THAT FOLLOW P TAG), GROUP THEM IN A UL
  const groupRemainingRogueLisIntoUL = (text: string) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(text, "text/html");

    // Find consective rogue lis that come after a p tag
    const orphanedLiTagsWhichFollowPTag = Array.from(
      dom.querySelectorAll("li")
    ).filter((li) => {
      if (
        li.previousElementSibling &&
        li.previousElementSibling.tagName === "P"
      ) {
        return li;
      }
    });
    //   console.log("DOM IN text:", text);
    //   console.log("DOM IN Q:", dom);
    //   console.log("Consecutive rogue lis:", orphanedLiTagsWhichFollowPTag);

    // For each
    orphanedLiTagsWhichFollowPTag.forEach((rogue, index) => {
      // make a clone
      const clone = rogue.cloneNode(true) as HTMLLIElement;

      // create an array called liGroup to store consecutive lis
      const liGroup: HTMLLIElement[] = [];

      // Add the clone to the group
      liGroup.push(clone);

      // check the next items after the rogue and s
      let currentElement: HTMLElement | null = rogue;
      while (currentElement) {
        const nextItem = currentElement.nextElementSibling;
        if (nextItem && nextItem.tagName === "LI") {
          // Clone then push clone to array
          const liClone = nextItem.cloneNode(true);
          liGroup.push(liClone as HTMLLIElement);

          // Assign next current element
          currentElement = nextItem.nextElementSibling as HTMLElement;

          // delete original
          nextItem.remove();
        } else {
          break;
        }
      }

      // replace original with ul containing items
      // console.log("LI GROUP:", liGroup);
      const newUl = dom.createElement("ul");
      liGroup.forEach((li) => {
        newUl.append(li);
      });
      rogue.replaceWith(newUl);
    });
    //   console.log("NEWER DOM:", dom);
    return dom.body.innerHTML;
  };
  updatedDomString = groupRemainingRogueLisIntoUL(updatedDomString);
  // console.log("AFTER STEP 2:", updatedDomString);

  // 3 (DONE - DOM UNALTERED). NOW THAT THERE ARE NO ROGUES IN UPDATED DOM, FIND P TAGS THAT MATCH CHAR
  const getPTagsWithChar = (text: string) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(text, "text/html");
    //   console.log(dom);

    const charArray = ["• ", "· "];

    //   const matchingPTags = Array.from(dom.querySelectorAll("p")).filter(
    //     (p) => {
    //       if (p.querySelector("span")) {
    //         const span = p.querySelector("span");
    //         if (span.textContent.startsWith(startsWith)) {
    //           return p;
    //         }
    //       }
    //     }
    //   );
    const matchingPTags = Array.from(dom.querySelectorAll("p")).filter((p) => {
      const span = p.querySelector("span");
      if (span) {
        const spanText = span.textContent.trim();
        if (charArray.some((char) => spanText.startsWith(char))) {
          return true;
        }
      }
      return false;
    });
    //   console.log("MATCHES:", matchingPTags);
    return matchingPTags;
  };
  const pTagsWithChar = getPTagsWithChar(updatedDomString);

  // 4 (DONE). IF ANY SUCH P TAGS ARE FOUND, WE NEED TO
  const handleNestingIntoPTags = (
    pTagsWithChar: HTMLElement[],
    domString: string
  ) => {
    if (pTagsWithChar.length > 0) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(domString, "text/html");

      // a) REVERSE THE ARRAY TO START FROM THE BOTTOM
      const reversed = pTagsWithChar.reverse();
      reversed.forEach((pT) => {
        // b) Clone the ptags & c) Create an li for the p tag content
        const content = pT.innerText;
        const newLi = dom.createElement("li");
        const span = dom.createElement("span");
        span.innerText = content;
        newLi.append(span);

        // d) we need to find the pTag in the dom
        const pTagLocationInDom = Array.from(dom.querySelectorAll("p")).filter(
          (p) => {
            if (p.innerText === span.innerText) {
              return p;
            }
          }
        )[0];

        // e) iterate over next siblings of the ptag in dom, until the next sibling is not a ul
        let pTagNextSibling: Element | null =
          pTagLocationInDom.nextElementSibling;
        while (pTagNextSibling && pTagNextSibling.tagName === "UL") {
          // f) for each iterated sibling (ul), we need to copy it,
          // create an li and wrap it in that li
          const copied = pTagNextSibling.cloneNode(true) as HTMLUListElement;
          const containerLI = dom.createElement("li");
          containerLI.append(copied);

          // g) we need to first assign the next sibling,
          // then replace the iterated sibling with the wrapping li
          const thisOne = pTagNextSibling;
          pTagNextSibling = thisOne.nextElementSibling;
          thisOne.replaceWith(containerLI);
        }

        // h) We need to find, then replace the original p tags in the dom with the new li with the p content
        pTagLocationInDom.replaceWith(newLi);
      });
      //   console.log("Its fine", dom);
      // i) Then we need to find any rogue lis that are consecutive and wrap then in a ul

      const rogueLis = Array.from(dom.querySelectorAll("li")).filter((li) => {
        if (
          li.parentElement === null ||
          (li.parentElement && li.parentElement.tagName !== "UL")
        ) {
          return li;
        }
      });
      //   console.log("ROGUES", rogueLis);

      // Define groups for sections Li that are consecutive (to be replaced with ul)
      const liGroups = [];
      // Define a list of processed lis to avoid logic on same li
      const processed: HTMLLIElement[] = [];
      rogueLis.forEach((rogue) => {
        // Define a group for these consecutive lis (to be pushed to liGroups)
        const thisGroup: HTMLLIElement[] = [];

        // Push the rogue as processed and to the group
        thisGroup.push(rogue);
        processed.push(rogue);

        // Iterate over the next siblings if it is in the rogue lis and not yet processed
        let nextSibling: null | Element = rogue.nextElementSibling;
        while (
          nextSibling &&
          rogueLis.includes(nextSibling as HTMLLIElement) &&
          !processed.includes(nextSibling as HTMLLIElement)
        ) {
          // Add them to the processed and group arrays
          processed.push(nextSibling as HTMLLIElement);
          thisGroup.push(nextSibling as HTMLLIElement);

          // reassign the next sibling as the one after
          nextSibling = nextSibling.nextElementSibling;
        }

        liGroups.push(thisGroup);
      });

      liGroups.forEach((group) => {
        // Create a ul for the group
        const groupUL = dom.createElement("ul");
        group.forEach((item) => {
          // Copy the item
          const clone = (item as Element).cloneNode(true) as HTMLLIElement;
          // Append to the groupUl
          groupUL.append(clone);
        });
        // Replace the first item in the group with the groupUl and remove the other items
        group.forEach((groupItem, index) => {
          if (index === 0) {
            (groupItem as Element).replaceWith(groupUL);
          } else {
            (groupItem as Element).remove();
          }
        });
      });

      console.log("DOM AFTER LOGIC");
      return dom.body.innerHTML;
    } else {
      console.log("DOM UNCHANGED");
      return domString;
    }
  };
  updatedDomString = handleNestingIntoPTags(pTagsWithChar, updatedDomString);

  // 5. Finally, remove the special character
  const removeSpecialChar = (domString: string) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(domString, "text/html");

    const charArray = ["• ", "· "];

    const lisToBeUpdated = Array.from(dom.querySelectorAll("li")).filter(
      (li) => {
        const span = li.querySelector("span");
        if (span) {
          const spanText = span.textContent.trim();
          if (charArray.some((char) => spanText.startsWith(char))) {
            return true;
          }
        }
        return false;
      }
    );

    // console.log(lisToBeUpdated);

    lisToBeUpdated.forEach((item) => {
      charArray.forEach((char) => {
        item.innerText = item.innerText.replace(char, "");
      });
    });

    return dom.body.innerHTML;
  };

  updatedDomString = removeSpecialChar(updatedDomString);

  const newHtml = updatedDomString;
  return newHtml;
};

const convertSecondLevel = (text: string, colorMode) => {
  // Function to find a matching li based on content
  function findLiByContent(dom, content) {
    const lis = dom.querySelectorAll("li");
    for (const li of lis) {
      if (li.textContent === content) {
        return li.closest("li");
      }
    }
    return null;
  }

  const findLiByContentAndNotIncludingClass = (dom, content, classToAvoid) => {
    const lis = dom.querySelectorAll("li");
    for (const li of lis) {
      if (
        li.textContent === content &&
        !li.classList.contains(classToAvoid) &&
        !li.parentNode.classList.contains("editor-ul2")
      ) {
        return li.closest("li");
      }
    }
    return null;
  };

  // Get any p tags that have multiple spans underneath them. Get the innerText of each
  // and concatenate them. Remove the spans and replace with a span that has the concatenated string as the inner text
  // const processText = (text: string) => {
  //   const parser = new DOMParser();
  //   const dom = parser.parseFromString(text, "text/html");

  //   // Get all p tags
  //   const pTags = dom.querySelectorAll("p");

  //   pTags.forEach((pTag) => {
  //     // Check if the p tag has multiple spans
  //     const spans = pTag.querySelectorAll("span");
  //     if (spans.length > 1) {
  //       // Get the innerText of each span and concatenate them
  //       let concatenatedText = "";
  //       spans.forEach((span) => {
  //         concatenatedText += span.innerText;
  //       });

  //       // Remove the spans
  //       pTag.innerHTML = "";

  //       // Create a new span with the concatenated text and append it to the p tag
  //       const newSpan = dom.createElement("span");
  //       newSpan.innerText = concatenatedText;
  //       pTag.appendChild(newSpan);
  //     }
  //   });

  //   // Return the modified HTML
  //   return dom.body.innerHTML;
  // };
  // const startsWithUnicode = (text, unicode) => {
  //   // Get the Unicode value of the first character in the text
  //   const firstCharUnicode = text.charCodeAt(0);

  //   // Compare with the Unicode value of the specified character
  //   return firstCharUnicode === unicode;
  // };

  // const secondProcessText = (text: string) => {
  //   const parser = new DOMParser();
  //   const dom = parser.parseFromString(text, "text/html");

  //   // Convert them all to the same format by replacing weird special characters
  //   // Where they come first in the innerText
  //   const newPtags = dom.querySelectorAll("p");

  //   newPtags.forEach((tag) => {
  //     const content = tag.innerText;
  //     const newPTag = dom.createElement("p");
  //     const newSpan = dom.createElement("span");
  //     newSpan.innerHTML = "";
  //     let spanContent = "";

  //     if (
  //       startsWithUnicode(content, 0x2022) ||
  //       tag.innerText.startsWith("·")
  //     ) {
  //       // · 0x00B7
  //       // • 0x2022
  //       console.log("STARTS WITH 1st level");
  //       spanContent = `·${tag.innerText.substring(1)}`;
  //     } else if (startsWithUnicode(content, 0x006f)) {
  //       // o 0x006F
  //       // o 0x006F
  //       console.log("STARTS WITH 2nd level");
  //       spanContent = `z!${tag.innerText.substring(1)}`;
  //     } else if (
  //       startsWithUnicode(content, 0x25a0) ||
  //       startsWithUnicode(content, 0x201d) ||
  //       tag.innerHTML.startsWith("§") ||
  //       tag.innerHTML.startsWith("")
  //     ) {
  //       // § 0x00A7
  //       //  0x25A0
  //       //   U+201D
  //       console.log("STARTS WITH 3rd level");
  //       spanContent = `§${tag.innerText.substring(1)}`;
  //     } else {
  //       console.log(`Starts with something else: ${tag.innerText[0]}`);
  //     }

  //     if (spanContent !== "") {
  //       newSpan.innerText = spanContent;
  //       newPTag.append(newSpan);
  //       console.log("NEW PTAG: ", newPTag);
  //       tag.replaceWith(newPTag);
  //     }
  //   });

  //   const fixUp = (innerHTML) => {
  //     const p = new DOMParser();
  //     const d = parser.parseFromString(innerHTML, "text/html");
  //     console.log("ICE", d);
  //     // ·\t
  //     // z!\t
  //     // \t
  //     return d.body.innerHTML;
  //   };

  //   return fixUp(dom.body.innerHTML);
  // };

  // •
  // o
  // 
  let secondLevel = text;
  // eslint-disable-next-line
  // with tab 'o ' - irregular whitespace
  // with space 'o '
  const secondFormat =
    /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">o (.*?)<\/span><\/p>/;

  // const secondFormat = /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">z! (.*?)<\/span><\/p>/;
  const secondDesiredFormat =
    '<li value=${index} class=`editor-li-${colorMode} editor-nested-list-item`}><span style="white-space: pre-wrap;">${content}</span></li>';

  //   console.log(text);
  // 1. Check if there are any instances in the refined string that match the second format (p tag with a span that has the special character and a space)

  const secondMatches =
    secondLevel.match(
      /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">o (.*?)<\/span><\/p>/g
    ) ||
    //   secondLevel.match(
    //     /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">z! (.*?)<\/span><\/p>/g
    //   ) ||
    //   //   secondLevel.match(
    //   //     /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">o<\/span>(<span style="white-space: pre-wrap;">.*?<\/span>.*?)?<\/p>/g
    //   //   ) ||
    [];

  // const regex = /<p\b[^>]*><span\b[^>]*>\s*z!.*?<\/span>.*?<\/p>/g;
  // const secondMatches = secondLevel.match(regex) || [];

  // console.log("SM", secondMatches);
  // console.log(secondLevel);

  // 2. replace items in the first matches array with the new li format
  secondMatches.forEach((match, index) => {
    //   const newParser = new DOMParser();
    //   const newDOM = newParser.parseFromString(match, "text/html");
    //   const item = newDOM.querySelectorAll("p")[0];
    //   const content = item.innerText.substring(2);
    const content = match.match(secondFormat)?.[2] || "";
    // console.log("CONTENT", content);
    secondLevel = secondLevel.replace(
      match,
      secondDesiredFormat.replace("${content}", content)
    );
  });

  // 3. Convert to a DOM for parsing
  const parser = new DOMParser();
  const dom = parser.parseFromString(secondLevel, "text/html");

  // 4. Check if there are any sibling li groups which aren't within a ul(e.g. </ul><li>...</li><li>...</li><p>).
  // For each group found, append the groups to an array.
  // For each item in the array, create a ul with the items appended, replacing those lis in the actual dom.
  const lis = dom.querySelectorAll("li");
  const skippedLIs: HTMLLIElement[] = [];

  const groupedLIs: HTMLLIElement[][] = [];
  lis.forEach((li) => {
    if (!skippedLIs.includes(li)) {
      const liGroup: HTMLLIElement[] = [];
      if (li.parentElement?.tagName.toLowerCase() !== "ul") {
        // Check if the li's next sibling element is also an li without a parent ul
        // If it is, append that too and keep checking each consecutive next sibling for if it is an li
        // Add all of them to the liGroup, until the next element in the DOM is not an li.
        // Ensure that all the lis that have been pushed to the liGroup are in skippedLis and aren't checked again.
        let currentLi = li;
        while (
          currentLi &&
          currentLi?.tagName.toLowerCase() === "li" &&
          currentLi.parentElement?.tagName.toLowerCase() !== "ul"
        ) {
          // Add the li to the liGroup
          liGroup.push(currentLi);
          skippedLIs.push(currentLi);
          currentLi = currentLi.nextElementSibling as HTMLLIElement;
        }
        groupedLIs.push(liGroup);
      }
    }
  });

  const lisToInsert = [];

  // After grouping the lis, create ul elements and append the li groups
  groupedLIs.forEach((liGroup) => {
    // Create a ul to hold the lis from the group, and an li to hold the ul
    const liElement = dom.createElement("li");
    liElement.className = `editor-li-${colorMode} editor-nested-list-item`;
    const ulElement = dom.createElement("ul");
    ulElement.className = `editor-ul-${colorMode} editor-ul2`;

    // grab each li from the group and append to the ul
    liGroup.forEach((liItem) => {
      ulElement.appendChild(liItem);
    });

    // clone and append the ul to the li
    const clonedUlElement = ulElement.cloneNode(true) as HTMLUListElement;
    liElement.append(clonedUlElement);
    const clonedLiElement = liElement.cloneNode(true) as HTMLLIElement;
    //   console.log(clonedLiElement);
    lisToInsert.push(clonedLiElement);
  });

  // console.log(lisToInsert);
  // Replacement logic ================================================ (ABOVE IS OKAY)

  // Use the text to create a new dom which will be the one returned/cloned then returned.
  const textTocreateDomFrom = secondLevel;
  const newParser = new DOMParser();
  const newDom = newParser.parseFromString(textTocreateDomFrom, "text/html");

  // Iterate over the grouped lis
  groupedLIs.forEach((liGroup, index) => {
    // For each liGroup first item, find where that li is in the newDom that matches.
    const originalLi = liGroup[0];
    const selector =
      'li.editor-nested-list-item span[style="white-space: pre-wrap;"]';
    const originalLiContent = originalLi.textContent || "";

    let previousElement;
    const matchingLi = findLiByContent(newDom, originalLiContent);
    //   console.log("Match!: ", matchingLi);

    if (matchingLi) {
      previousElement = matchingLi.previousElementSibling;
      if (previousElement) {
        //   console.log("Previous element sibling: ", previousElement);
        if (previousElement.className.includes("editor-ul1")) {
          previousElement.append(lisToInsert[index]);
          // Now remove the items in that li Group from the dom so that the content doesnt repeat outside of the ul it is appended to
          liGroup.forEach((liInGroup) => {
            const liToRemove = liInGroup;
            const liToRemoveContent = liToRemove.textContent || "";
            const classToAvoid = "editor-nested-list-item";

            const matchinLiToRemove = findLiByContentAndNotIncludingClass(
              newDom,
              liToRemoveContent,
              classToAvoid
            );
            if (matchinLiToRemove) {
              // console.log("LI TO REMOVE: ", matchinLiToRemove);
              matchinLiToRemove.remove();
            }
          });
        }
      }
      // console.log the previous element before each match
    }
  });

  secondLevel = newDom.body.innerHTML;
  return secondLevel;
};

const convertThirdLevel = (text: string) => {
  const thirdLevel = text;

  // Find p tag groups which match the condition and return them
  const getPGroups = (text: string) => {
    // 1. parse the text to a dom
    const parser = new DOMParser();
    const dom = parser.parseFromString(text, "text/html");

    const charArray = ["§ ", " "];

    // 2. and define arrays
    const pTagsWhichMatchLevel3: HTMLParagraphElement[] = [];
    const paragraphGroups: HTMLParagraphElement[][] = [];

    // 3. search for items that match the below conditions within the dom, and add them to pTagsWhichMatchLevel3 array
    // Also add it to the group and continuously scan next elements to see if they also belong in the group and match the conditions
    // If they do, add them to the group and pTagsWhichMatchLevel3
    // a) p tags with a child span which begins with the special character
    const paragraphs = dom.querySelectorAll("p");
    paragraphs.forEach((paragraph) => {
      const span = paragraph.querySelector("span");
      if (
        span &&
        charArray.some((char) => span.textContent?.startsWith(char))
      ) {
        if (!pTagsWhichMatchLevel3.includes(paragraph)) {
          let currentElement: Element | null = paragraph;
          const group: HTMLParagraphElement[] = [];

          while (currentElement) {
            if (
              currentElement.tagName === "P" &&
              !pTagsWhichMatchLevel3.includes(
                currentElement as HTMLParagraphElement
              ) &&
              !group.includes(currentElement as HTMLParagraphElement)
            ) {
              pTagsWhichMatchLevel3.push(
                currentElement as HTMLParagraphElement
              );
              group.push(currentElement as HTMLParagraphElement);
            }

            // Move to the next sibling
            currentElement = currentElement.nextSibling as Element | null;

            // Check if the next sibling is a valid element and matches the conditions
            if (currentElement && currentElement.tagName === "P") {
              const siblingSpan = currentElement.querySelector("span");

              if (
                siblingSpan &&
                charArray.some((char) =>
                  siblingSpan.textContent?.startsWith(char)
                )
              ) {
                // Add the current element to the array/group because it is level 3
                pTagsWhichMatchLevel3.push(
                  currentElement as HTMLParagraphElement
                );
                group.push(currentElement as HTMLParagraphElement);
              } else {
                break; // Stop processing if the sibling doesn't match the condition
              }
            } else {
              break; // Stop processing if there is no next sibling
            }
          }

          if (group.length > 0) {
            paragraphGroups.push(group);
          }
        }
      }
    });

    //   console.log("P TAGS WHICH MATCH:");
    pTagsWhichMatchLevel3.forEach((item) => {
      // console.log(item.querySelector("span"));
    });

    //   console.log("PARAGRAPH GROUPS:");
    paragraphGroups.forEach((group) => {
      // console.log(group.map((item) => item.textContent));
    });
    return paragraphGroups;
  };
  // const pGroups = getPGroups(text, "§ ");
  const pGroups = getPGroups(text);

  // Create a new dom to update (this will be returned)
  const parser = new DOMParser();
  const dom = parser.parseFromString(thirdLevel, "text/html");

  // For each group in pGroups, create a ul, then convert the p tags to lis and append to the ul
  pGroups.forEach((group) => {
    const ul = dom.createElement("ul");

    group.forEach((item, index) => {
      const itemText = item.textContent || "";

      if (index === 0) {
        //   console.log("First item!", item);
        // Find the location of the p tag with the innerText matching the item
        const targetParagraph = Array.from(dom.querySelectorAll("p")).find(
          (paragraph) => paragraph.textContent === itemText
        );

        if (targetParagraph) {
          // Replace that p tag with the ul
          targetParagraph.replaceWith(ul);

          const li = dom.createElement("li");
          li.textContent = itemText.substring(2);
          ul.appendChild(li);
        }
      } else {
        // Find the location of the p tag with the innerText matching the item
        const targetParagraph = Array.from(dom.querySelectorAll("p")).find(
          (paragraph) => paragraph.textContent === itemText
        );

        if (targetParagraph) {
          // Remove that p tag
          targetParagraph.remove();

          const li = dom.createElement("li");
          li.textContent = itemText.substring(2);
          ul.appendChild(li);
        }
      }
    });

    // If it is (call it priorLiElement), create a ul (called wrapperUl) that will have a copy of the li as a child (and will replace the original li in the dom)
    // Also append ul to that new wrapperUl, after wrapping the ul in an li

    // Get the previous sibling
    const previousSibling = ul.previousSibling;

    // Check if the previous sibling before the ul is an li without a ul parent
    if (
      previousSibling &&
      (previousSibling as Element).tagName === "LI" &&
      !(previousSibling as Element).querySelector("ul")
    ) {
      // If it is (call it priorLiElement), create a ul (called wrapperUl)
      const wrapperUl = dom.createElement("ul");

      // Create a copy of the li as a child of wrapperUl
      const liCopy = dom.createElement("li");
      liCopy.textContent = previousSibling.textContent;
      // console.log("LICOPY CONTENT", liCopy);

      wrapperUl.appendChild(liCopy);

      // Replace the original li in the dom with wrapperUl
      previousSibling.replaceWith(wrapperUl);

      // Append ul to wrapperUl, after wrapping the ul in an li
      const liWrapper = dom.createElement("li");
      liWrapper.appendChild(ul);
      wrapperUl.appendChild(liWrapper);
    }
  });

  // stringify the dom and return it instead of thirdLevel
  const newHtml = dom.body.innerHTML;
  return newHtml;
};

const finalPass = (text: string) => {
  return text;
};

const handlePastedWordList = (text: string, colorMode: string) => {
  console.log("RUNNING");
  const levelTwoFinishedString = convertSecondLevel(text, colorMode);
  const levelThreeFinishedString = convertThirdLevel(levelTwoFinishedString);
  const levelOneFinishedString = convertFirstLevel(levelThreeFinishedString);

  return levelOneFinishedString;
};

function $insertDataTransferForRichText(
  colorMode: string,
  dataTransfer: DataTransfer,
  selection: BaseSelection,
  editor: LexicalEditor
): void {
  //   const htmlString = dataTransfer.getData("application/x-lexical-editor");
  const htmlString = dataTransfer.getData("text/html");

  const removeHTMLSpace = (text: string) => {
    return text.replace(/&nbsp;/g, "");
  };

  //   Testing out nested lists.
  // •	Level 1 (1)
  // o	Level 2 (1: 1-1)
  // 	Level 3 (1: 2-1)
  // 	Level 3 (2: 2-1)
  // o	Level 2 (2: 1-1)
  // 	Level 3 (1: 2-2)
  // 	Level 3 (2: 2-2)
  // 	Level 3 (3: 2-2)
  // o	Level 2 (3: 1-1)
  // 	Level 3 (1: 2-3)
  // 	Level 3 (2: 2-3)
  // •	Level 1 (2)
  // o	Level 2 (1: 1-2)
  // o	Level 2 (2: 1-2)
  // •	Level 1 (3)
  // o	Level 2 (1:1-3)
  // 	Level 3 (1: 2-1)
  // 	Level 3 (2: 2-1)
  // o	Level 2 (2:1-3)

  //   console.log("THIS IS THE HTML STRING:", htmlString);
  if (htmlString) {
    // let replacedData = "";
    // // Remove whitespace in html format
    // replacedData = removeHTMLSpace(htmlString);
    // // Replace ol symbols and sections with html ol lis
    // replacedData = handlePastedWordList(replacedData, colorMode);

    // console.log("HTML STRING");
    try {
      //   const domString = handlePastedWordList(htmlString, colorMode);
      //   console.log("domString string:", htmlString);
      const withoutWhite = removeHTMLSpace(htmlString);

      const parser = new DOMParser();
      const dom = parser.parseFromString(withoutWhite, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);

      const newHTMLDom = customGenerateHTMLFromNodes(nodes, colorMode);
      const newDomString = handlePastedWordList(
        newHTMLDom.body.innerHTML,
        colorMode
      );
      const newDom = parser.parseFromString(newDomString, "text/html");

      const newNodes = $generateNodesFromDOM(editor, newDom);

      console.log(newDom);
      console.log(newNodes);

      //   console.log("DOM BODY INNER", dom.body.innerHTML);

      //   const newDOmString = handlePastedWordList(dom.body.innerHTML, colorMode);
      //   const newDOM = parser.parseFromString(newDOmString, "text/html");

      return $insertGeneratedNodes(editor, newNodes, selection);
    } catch (e) {
      // Fail silently.
      console.log("ERROR", e);
    }
  }
}

function onPasteForRichText(
  colorMode: string,
  event: CommandPayloadType<typeof PASTE_COMMAND>,
  editor: LexicalEditor
  //   selection: BaseSelection,
): void {
  event.preventDefault();
  editor.update(
    () => {
      const selection = $getSelection();
      const clipboardData =
        event instanceof InputEvent || event instanceof KeyboardEvent
          ? null
          : event.clipboardData;
      if (clipboardData != null && $INTERNAL_isPointSelection(selection)) {
        $insertDataTransferForRichText(
          colorMode,
          clipboardData,
          selection,
          editor
        );
      }
    },
    {
      tag: "paste",
    }
  );
}

export const CustomPastePlugin = () => {
  const [editor] = useLexicalComposerContext();
  const { colorMode } = useColorMode();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (e: ClipboardEvent) => {
        if (!(e instanceof ClipboardEvent)) {
          return false;
        }
        const { clipboardData } = e;
        if (clipboardData && clipboardData.getData) {
          //   const clipboardText = clipboardData?.getData(
          //     "application/x-lexical-editor"
          //   );
          const selection = $getSelection();
          console.log(selection);
          if (clipboardData !== null && $INTERNAL_isPointSelection(selection)) {
            onPasteForRichText(colorMode, e, editor);

            return true; // If this is false, the paste command will be considered
            // not handled, and content will be pasted from elsewhere.
          }
        }
      },
      //   COMMAND_PRIORITY_EDITOR
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);
  return null;
};

const customGenerateHTMLFromNodes = (
  nodes: LexicalNode[],
  colorMode: string
) => {
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
        listitemChecked: "editor-list-item-checked",
        listitemUnchecked: "editor-list-item-unchecked",
        nested: {
          listitem: "editor-nested-list-item",
        },
        // Handling styling for each level of list nesting (1st is default styling)
        ulDepth: ["editor-ul1", "editor-ul2", "editor-ul3"],
        olDepth: ["editor-ol1", "editor-ol2", "editor-ol3"],
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
      table: colorMode === "light" ? "table-light" : "table-dark",
      tableAddColumns:
        colorMode === "light"
          ? "table-add-columns-light"
          : "table-add-columns-dark",
      tableAddRows:
        colorMode === "light" ? "table-add-rows-light" : "table-add-rows-dark",
      tableCell: colorMode === "light" ? "table-cell-light" : "table-cell-dark",
      tableCellActionButton:
        colorMode === "light"
          ? "table-action-button-light"
          : "table-action-button-dark",
      tableCellActionButtonContainer:
        colorMode === "light"
          ? "table-action-button-container-light"
          : "table-action-button-container-dark",
      tableCellEditing:
        colorMode === "light"
          ? "table-cell-editing-light"
          : "table-cell-editing-dark",
      tableCellHeader:
        colorMode === "light"
          ? "table-cell-header-light"
          : "table-cell-header-dark",
      tableCellPrimarySelected:
        colorMode === "light"
          ? "table-cell-primary-selected-light"
          : "table-cell-primary-selected-dark",
      tableCellResizer:
        colorMode === "light"
          ? "table-cell-resizer-light"
          : "table-cell-resizer-dark",
      tableCellSelected:
        colorMode === "light"
          ? "table-cell-selected-light"
          : "table-cell-selected-dark",
      tableCellSortedIndicator:
        colorMode === "light"
          ? "table-cell-sorted-indicator-light"
          : "table-cell-sorted-indicator-dark",
      tableResizeRuler:
        colorMode === "light"
          ? "table-cell-resize-ruler-light"
          : "table-cell-resize-ruler-dark",
      tableSelected:
        colorMode === "light" ? "table-selected-light" : "table-selected-dark",
      tableSelection:
        colorMode === "light"
          ? "table-selection-light"
          : "table-selection-dark",
    };
  };
  // Catch errors that occur during Lexical updates
  const onError = (error: Error) => {
    console.log(error);
  };

  // Generate the theme based on the current colorMode
  const theme = generateTheme(colorMode);
  //   console.log("NODES", nodes);
  const initialConfig = {
    namespace: "Annual Report Document Editor",
    editable: true,
    theme,
    onError,
    nodes: [ListNode, ListItemNode, TableCellNode, TableNode, TableRowNode],
  };
  const parser = new DOMParser();
  const dom = parser.parseFromString("", "text/html");

  const editor = null;
  //   console.log(dom);
  nodes.forEach((n) => {
    // console.log(n.createDOM(initialConfig));
    // console.log(n);
    const domItem = n.createDOM(initialConfig, editor);
    const span = dom.createElement("span");
    span.style.cssText = "white-space: pre-wrap;";

    span.innerText = n.getTextContent();
    domItem.append(span);
    if ((domItem as Element).tagName === "P") {
      domItem.dir = "ltr";
    }
    dom.body.append(domItem);
  });
  //   console.log(dom);
  return dom;
};