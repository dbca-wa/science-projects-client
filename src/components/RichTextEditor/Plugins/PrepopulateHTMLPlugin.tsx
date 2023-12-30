import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
// import { $generateNodesFromDOM, $getRoot, $getList, ListItemNode, ListNode } from "@lexical/html";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  $getRoot,
  $getSelection,
  LexicalNode,
  RangeSelection,
  createCommand,
} from "lexical";
import { CLEAR_EDITOR_COMMAND, LexicalEditor } from "lexical";
import { useColorMode } from "@chakra-ui/react";
interface HTMLPrepopulationProp {
  data: string;
}

export const PrepopulateHTMLPlugin = ({ data }: HTMLPrepopulationProp) => {
  const { colorMode } = useColorMode();

  const generateHtmlTable = (tableData: string[][]) => {
    const tableRows = tableData
      .map(
        (row, rowIndex) =>
          `<tr>${row
            .map(
              (cell, colIndex) =>
                `<${
                  rowIndex === 0 || colIndex === 0 ? "th" : "td"
                } class="table-cell-dark${
                  rowIndex === 0 ? " table-cell-header-dark" : ""
                }">${cell}</${rowIndex === 0 || colIndex === 0 ? "th" : "td"}>`
            )
            .join("")}</tr>`
      )
      .join("");

    return `<table class="table-dark">
          <colgroup>
            <col>
            <col>
            <col>
            <col>
            <col>
          </colgroup>
          <tbody>
            ${tableRows}
          </tbody>
        </table>`;
  };

  const removeHTMLSpace = (text: string) => {
    return text.replace(/&nbsp;/g, "");
  };

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
      const matchingPTags = Array.from(dom.querySelectorAll("p")).filter(
        (p) => {
          const span = p.querySelector("span");
          if (span) {
            const spanText = span.textContent.trim();
            if (charArray.some((char) => spanText.startsWith(char))) {
              return true;
            }
          }
          return false;
        }
      );
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
          let pTagLocationInDom = Array.from(dom.querySelectorAll("p")).filter(
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
        console.log("Its fine", dom);
        // i) Then we need to find any rogue lis that are consecutive and wrap then in a ul

        const rogueLis = Array.from(dom.querySelectorAll("li")).filter((li) => {
          if (
            li.parentElement === null ||
            (li.parentElement && li.parentElement.tagName !== "UL")
          ) {
            return li;
          }
        });
        console.log("ROGUES", rogueLis);

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

        console.log("DOM AFTER LOGIC", dom);
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

      console.log(lisToBeUpdated);

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

  const convertSecondLevel = (text: string) => {
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

    const findLiByContentAndNotIncludingClass = (
      dom,
      content,
      classToAvoid
    ) => {
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

    let secondLevel = text;
    // with tab 'o '
    // with space 'o '
    const secondFormat = /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">o (.*?)<\/span><\/p>/;

    // const secondFormat = /<p class="editor-p-(dark|light)" dir="ltr"><span style="white-space: pre-wrap;">z! (.*?)<\/span><\/p>/;
    const secondDesiredFormat =
      '<li value=${index} class=`editor-li-${colorMode} editor-nested-list-item`}><span style="white-space: pre-wrap;">${content}</span></li>';

    console.log(text);
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
      console.log("CONTENT", content);
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
            let group: HTMLParagraphElement[] = [];

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
    const levelTwoFinishedString = convertSecondLevel(text);
    const levelThreeFinishedString = convertThirdLevel(levelTwoFinishedString);
    const levelOneFinishedString = convertFirstLevel(levelThreeFinishedString);

    const finalPassString = finalPass(levelOneFinishedString);
    // Run another pass (new function) over the string tgo ensure that the sublists are in the right location

    return finalPassString;
  };

  const [editor, editorState] = useLexicalComposerContext();
  useEffect(() => {
    editor.update(() => {
      let replacedData = "";
      // Remove whitespace in html format
      replacedData = removeHTMLSpace(data);
      // Replace ol symbols and sections with html ol lis
      replacedData = handlePastedWordList(replacedData, colorMode);

      // Replace strings representing tables with actual HTML tables
      replacedData = replacedData.replace(/\[\[.*?\]\]/g, (match) => {
        const tableData = JSON.parse(match);
        return generateHtmlTable(tableData);
      });

      // Parse the replaced data
      const parser = new DOMParser();
      const dom = parser.parseFromString(replacedData, "text/html");

      //   console.log(dom.body.children);
      const bunchOfNodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      // let currentListNode: ListNode | null = null;
      // let currentListItemNode: ListItemNode | null = null;

      bunchOfNodes.forEach((node, index) => {
        if (root) {
          const firstChild = root.getFirstChild();
          // Remove any empty paragraph node caused by the Lexical 0.12.3 update
          if (firstChild !== null) {
            if (
              firstChild.getTextContent() === "" ||
              firstChild.getTextContent() === undefined ||
              firstChild.getTextContent() === null
            ) {
              firstChild.remove();
            }
          }

          if (node !== null) {
            root.append(node);
          }
        }
      });
      root.selectEnd();
    });
  }, []);
  return null;
};
