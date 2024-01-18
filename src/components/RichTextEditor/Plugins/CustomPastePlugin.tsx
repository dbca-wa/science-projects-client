import {
  BaseSelection,
  CommandPayloadType,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  TextNode,
} from "lexical";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $INTERNAL_isPointSelection,
  $getSelection,
  $isTextNode,
  $parseSerializedNode,
  COMMAND_PRIORITY_CRITICAL,
  PASTE_COMMAND,
  createCommand,
} from "lexical";

import { useEffect } from "react";
import { $generateNodesFromDOM } from "@lexical/html";
import { useColorMode } from "@chakra-ui/react";

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
        if (
          !li.parentElement ||
          (li.parentElement && li.parentElement.tagName !== "UL")
        ) {
          return li;
        }
      }
    );

    // One by one,
    orphanedLiTags.forEach((rogue) => {
      // make a copy of the rogue li
      const rogueClone = rogue.cloneNode(true) as HTMLElement;
      // add that copy to the last ul found in the dom before the rogue li
      let lastUl: HTMLElement | null = null;
      let prevSibling = rogue.previousElementSibling as HTMLElement;
      while (prevSibling) {
        if (prevSibling && prevSibling.tagName === "UL") {
          lastUl = prevSibling;
          break;
        } else if (prevSibling && prevSibling.tagName === "LI") {
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
    orphanedLiTagsWhichFollowPTag.forEach((rogue) => {
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

  // •
  // o
  // 
  let secondLevel = text;
  // eslint-disable-next-line
  // with tab 'o ' - irregular whitespace
  // with space 'o '
  const secondFormat =
    /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">o (.*?)<\/span><\/p>/;

  const secondDesiredFormat =
    '<li value=${index} class=`editor-li-${colorMode} editor-nested-list-item`}><span style="white-space: pre-wrap;">${content}</span></li>';

  const secondMatches =
    secondLevel.match(
      /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">o (.*?)<\/span><\/p>/g
    ) || [];

  // 2. replace items in the first matches array with the new li format
  secondMatches.forEach((match) => {
    const content = match.match(secondFormat)?.[2] || "";
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
      if (
        li.parentElement &&
        li.parentElement?.tagName.toLowerCase() !== "ul"
      ) {
        // Check if the li's next sibling element is also an li without a parent ul
        // If it is, append that too and keep checking each consecutive next sibling for if it is an li
        // Add all of them to the liGroup, until the next element in the DOM is not an li.
        // Ensure that all the lis that have been pushed to the liGroup are in skippedLis and aren't checked again.
        let currentLi = li;
        while (
          currentLi &&
          currentLi?.tagName.toLowerCase() === "li" &&
          currentLi.parentElement &&
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

  // Use the text to create a new dom which will be the one returned/cloned then returned.
  const textTocreateDomFrom = secondLevel;
  const newParser = new DOMParser();
  const newDom = newParser.parseFromString(textTocreateDomFrom, "text/html");

  // Iterate over the grouped lis
  groupedLIs.forEach((liGroup, index) => {
    // For each liGroup first item, find where that li is in the newDom that matches.
    const originalLi = liGroup[0];

    const originalLiContent = originalLi.textContent || "";

    let previousElement;
    const matchingLi = findLiByContent(newDom, originalLiContent);

    if (matchingLi) {
      previousElement = matchingLi.previousElementSibling;
      if (previousElement) {
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
              matchinLiToRemove.remove();
            }
          });
        }
      }
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
              currentElement &&
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

const handlePastedWordOrderedList = (replacedData: string) => {
  const handled = replacedData;

  const parser = new DOMParser();
  const dom = parser.parseFromString(handled, "text/html");

  // 1. filter for p tags which start with a lowercase letter and a period, then space.
  // excluding any p tags that start with 'i. ', which follow a sibling that does not start with 'h. '
  // const level2pTags = Array.from(dom.querySelectorAll("p")).filter((p) =>
  //   /^[a-z]\. /.test(p.innerText)
  // );
  const level2pTags = Array.from(dom.querySelectorAll("p")).filter((p) => {
    const text = p.innerText;
    if (/^[a-z]\. /.test(text)) {
      const previousSibling = p.previousElementSibling;
      if (
        previousSibling &&
        previousSibling.tagName === "P" &&
        text.startsWith("i. ") &&
        !/^[hH]\. /.test((previousSibling as HTMLParagraphElement).innerText)
      ) {
        return false; // Exclude if the previous sibling does not start with 'h. ', and the text starst with 'i. '
      }
      return true; // Include if it starts with a lowercase letter, a period, and a space
    }
    return false; // Exclude if it doesn't match the pattern
  });

  console.log(level2pTags);
  level2pTags.forEach((i) => console.log(i.innerText));

  // 2. Once found, transform into lis
  level2pTags.forEach((tag) => {
    const li = dom.createElement("li");
    const span = dom.createElement("span");
    // span.innerText = tag.innerText;
    const index = tag.innerText.indexOf(". ");

    if (index !== -1) {
      // Set span.innerText to the substring starting from the position after the first period and space
      span.innerText = tag.innerText.substring(index + 2);
    } else {
      // If no period and space found, set span.innerText to the full text
      span.innerText = tag.innerText;
    }

    li.append(span);

    // and replace original p tag.
    tag.replaceWith(li);

    // 3. Check p tags following li, if they are roman numerals,
    // group and wrap them into separate ols, then an li
    let nextItem = li.nextElementSibling;
    const nestedGroup: HTMLParagraphElement[] = [];
    while (nextItem && nextItem.tagName === "P") {
      const paragraph = nextItem as HTMLParagraphElement;

      // Check if the paragraph text represents a Roman numeral pattern
      if (/^[ivxl]+\. /i.test(paragraph.innerText)) {
        nestedGroup.push(paragraph);
        nextItem = nextItem.nextElementSibling;
      } else {
        break; // Break the loop if the paragraph does not match the pattern
      }
    }

    if (nestedGroup.length > 0) {
      const nestedOl = dom.createElement("ol");
      // Create list items and append them to the nested ordered list
      nestedGroup.forEach((paragraph, index) => {
        const li = document.createElement("li");
        const strIndex = tag.innerText.indexOf(". ");

        if (strIndex !== -1) {
          // Set span.innerText to the substring starting from the position after the first period and space
          li.innerText = tag.innerText.substring(strIndex + 2);
        } else {
          // If no period and space found, set span.innerText to the full text
          li.innerText = tag.innerText;
        }
        // li.innerText = paragraph.innerText;
        nestedOl.appendChild(li);
        if (index !== 0) {
          paragraph.remove();
        }
      });

      const parentLi = dom.createElement("li");
      parentLi.append(nestedOl);

      // Replace the original paragraphs with the nested ordered list
      nestedGroup[0].replaceWith(parentLi);
    }
  });

  // Now we must group rogue lis into an ordered list, per area.
  const rogueLiFirstElement = Array.from(dom.querySelectorAll("li")).filter(
    (li) => {
      if (
        li.previousElementSibling &&
        li.previousElementSibling.tagName !== "UL" &&
        li.previousElementSibling.tagName !== "OL" &&
        li.previousElementSibling.tagName !== "LI"
      ) {
        return true;
      }
    }
  );

  console.log("ROGUE LI Initial", rogueLiFirstElement);

  const liGroups = [];
  rogueLiFirstElement.forEach((li) => {
    const group: HTMLLIElement[] = [];
    group.push(li as HTMLLIElement);
    let currentItem: HTMLElement | null = li;

    while (
      currentItem &&
      currentItem.nextElementSibling &&
      currentItem.nextElementSibling.tagName === "LI"
    ) {
      currentItem = currentItem.nextElementSibling as HTMLElement;
      group.push(currentItem as HTMLLIElement);
    }
    console.log(group);
    liGroups.push(group);
  });
  console.log("ROGUE LI Groups", liGroups);

  // 4. Now with 3rd level and second levels as lis,
  // Find consecutive lis and group them as uls, then as an li

  // For each group, create an ol, add copies of the items of the group, wrap it in in li
  // and remove/replace originals

  liGroups.forEach((group) => {
    const ol = dom.createElement("ol");
    const li = dom.createElement("li");

    group.forEach((liItem, innerIndex) => {
      const copy = (liItem as Element).cloneNode(true);
      ol.append(copy);
      if (innerIndex !== 0) {
        (liItem as Element).remove();
      }
    });

    li.append(ol);

    group.forEach((liItem, innerIndex) => {
      if (innerIndex === 0) {
        (liItem as Element).replaceWith(li);
      }
    });
  });

  // 5. Next, search dom and convert p tags with ordinary numerals into lis.

  const numeralPTags = Array.from(dom.querySelectorAll("p")).filter((pTag) => {
    return /^[0-9]+\.\s/.test(pTag.innerText);
  });
  console.log("NUMERAL PTAGS", numeralPTags);

  const finalLiGroups = [];
  const processed = [];
  numeralPTags.forEach((pTag) => {
    const group: HTMLLIElement[] = [];
    if (!processed.includes(pTag)) {
      const li = dom.createElement("li");
      li.innerText = pTag.innerText;

      group.push(li);
      processed.push(pTag);

      let nextElement: null | Element = pTag.nextElementSibling;
      while (nextElement) {
        if (nextElement && nextElement.tagName === "LI") {
          nextElement = nextElement.nextElementSibling;
        } else if (numeralPTags.includes(nextElement as HTMLParagraphElement)) {
          const clonedNextAsLi = dom.createElement("li");
          clonedNextAsLi.innerText = (
            nextElement as HTMLParagraphElement
          ).innerText;

          if (!processed.includes(nextElement)) {
            group.push(clonedNextAsLi);
            processed.push(nextElement);
            nextElement = nextElement.nextElementSibling;
          }
        } else {
          break;
        }
      }

      finalLiGroups.push(group);
    }

    // For each group
    console.log("Final LI GROUPS:", finalLiGroups);

    finalLiGroups.forEach((group) => {
      group.forEach((liItem) => {
        const copy = (liItem as HTMLLIElement).cloneNode(true);
        // console.log("COPY", copy);

        // Find the item after the ptag (should be li if appending)
        const corresponding = Array.from(dom.querySelectorAll("p")).filter(
          (p) => {
            return liItem.innerText === p.innerText;
          }
        );
        // console.log("CORRESPONDING", corresponding[0]);
        if (corresponding.length > 0) {
          const strIndex = (copy as HTMLParagraphElement).innerText.indexOf(
            ". "
          );

          if (strIndex !== -1) {
            // Set span.innerText to the substring starting from the position after the first period and space
            (copy as HTMLLIElement).innerText = pTag.innerText.substring(
              strIndex + 2
            );
          } else {
            // If no period and space found, set span.innerText to the full text
            (copy as HTMLLIElement).innerText = pTag.innerText;
          }
          corresponding[0].replaceWith(copy);
        }
      });
    });
  });

  // Find groups of consecutive rogue lis
  const finalRogues = Array.from(dom.querySelectorAll("li")).filter((li) => {
    return (
      li.parentElement &&
      li.parentElement.tagName !== "OL" &&
      li.parentElement.tagName !== "UL"
    );
  });

  const checked: Element[] | null = [];
  const groups: Element[][] = [];
  finalRogues.forEach((rogue) => {
    const finalGroup: Element[] = [];
    if (!checked.includes(rogue)) {
      checked.push(rogue);
    }
    if (!finalGroup.includes(rogue)) {
      finalGroup.push(rogue);
    }
    let nextItem: null | Element = (rogue as Element).nextElementSibling;
    while (nextItem && nextItem.tagName === "LI") {
      checked.push(nextItem);
      finalGroup.push(nextItem);
      nextItem = nextItem.nextElementSibling;
    }

    groups.push(finalGroup);
  });

  groups.forEach((group) => {
    const ol = dom.createElement("ol");
    group.forEach((liItem, index) => {
      const copy = (liItem as Element).cloneNode(true);
      ol.append(copy);
      if (index === 0) {
        (liItem as Element).replaceWith(ol);
      } else {
        liItem.remove();
      }
    });
  });

  console.log("Handled Dom", dom);

  return dom.body.innerHTML;
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

  if (htmlString) {
    try {
      const withoutWhite = removeHTMLSpace(htmlString);

      const parser = new DOMParser();
      const dom = parser.parseFromString(withoutWhite, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);

      const newHTMLDom = customGenerateHTMLFromNodes(nodes, colorMode);
      let newDomString = handlePastedWordList(
        newHTMLDom.body.innerHTML,
        colorMode
      );
      newDomString = handlePastedWordOrderedList(newDomString);
      const newDom = parser.parseFromString(newDomString, "text/html");

      const newNodes = $generateNodesFromDOM(editor, newDom);

      console.log(newDom);
      console.log(newNodes);

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
  nodes.forEach((n) => {
    const domItem = n.createDOM(initialConfig, editor);
    const span = dom.createElement("span");
    span.style.cssText = "white-space: pre-wrap;";

    span.innerText = n.getTextContent();
    domItem.append(span);
    if (domItem && (domItem as Element).tagName === "P") {
      domItem.dir = "ltr";
    }
    dom.body.append(domItem);
  });
  return dom;
};
