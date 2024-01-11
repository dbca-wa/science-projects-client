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

  const checkIsHtml = (data: string) => {
    // Regular expression to check for HTML tags
    const htmlRegex = /<\/?[a-z][\s\S]*>/i;

    // Check if the string contains any HTML tags
    return htmlRegex.test(data);
  };

  const [fixedText, setFixedText] = useState(data);
  const isHtml = checkIsHtml(data);
  useEffect(() => {
    // console.log("IS Html:", isHtml);
    if (!isHtml) {
      setFixedText(
        `<p class="editor-p-light" dir="ltr"><span style="white-space: pre-wrap;">${data}</span></p>`
      );
    }
  }, [isHtml]);

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

  const [editor, editorState] = useLexicalComposerContext();
  useEffect(() => {
    editor.update(() => {
      let replacedData = "";
      // Remove whitespace in html format
      replacedData = removeHTMLSpace(data);
      // Replace ol symbols and sections with html ol lis
      // replacedData = handlePastedWordList(replacedData, colorMode);
      // replacedData = handlePastedWordOrderedList(replacedData, colorMode);

      // Replace strings representing tables with actual HTML tables
      replacedData = replacedData.replace(/\[\[.*?\]\]/g, (match) => {
        const tableData = JSON.parse(match);
        return generateHtmlTable(tableData);
      });

      // Parse the replaced data
      const parser = new DOMParser();
      const dom = parser.parseFromString(replacedData, "text/html");

      const bunchOfNodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();

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
            // console.log(node);
            if (node.__type === "text" && bunchOfNodes.length <= 1) {
              //
              // console.log("BUNCHONODES", bunchOfNodes);
            } else {
              root.append(node);
            }
          }
        }
      });
      root.selectEnd();
    });
  }, []);
  return null;
};

// const handlePastedWordOrderedList = (
//   replacedData: string,
//   colorMode: string
// ) => {
//   const handled = replacedData;

//   const parser = new DOMParser();
//   const dom = parser.parseFromString(handled, "text/html");

//   // 1. filter for p tags which start with a lowercase letter and a period, then space.
//   // excluding any p tags that start with 'i. ', which follow a sibling that does not start with 'h. '
//   // const level2pTags = Array.from(dom.querySelectorAll("p")).filter((p) =>
//   //   /^[a-z]\. /.test(p.innerText)
//   // );
//   const level2pTags = Array.from(dom.querySelectorAll("p")).filter((p) => {
//     const text = p.innerText;
//     if (/^[a-z]\. /.test(text)) {
//       const previousSibling = p.previousElementSibling;
//       if (
//         previousSibling &&
//         previousSibling.tagName === "P" &&
//         text.startsWith("i. ") &&
//         !/^[hH]\. /.test((previousSibling as HTMLParagraphElement).innerText)
//       ) {
//         return false; // Exclude if the previous sibling does not start with 'h. ', and the text starst with 'i. '
//       }
//       return true; // Include if it starts with a lowercase letter, a period, and a space
//     }
//     return false; // Exclude if it doesn't match the pattern
//   });

//   console.log(level2pTags);
//   level2pTags.forEach((i) => console.log(i.innerText));

//   // 2. Once found, transform into lis
//   level2pTags.forEach((tag) => {
//     const li = dom.createElement("li");
//     const span = dom.createElement("span");
//     // span.innerText = tag.innerText;
//     const index = tag.innerText.indexOf(". ");

//     if (index !== -1) {
//       // Set span.innerText to the substring starting from the position after the first period and space
//       span.innerText = tag.innerText.substring(index + 2);
//     } else {
//       // If no period and space found, set span.innerText to the full text
//       span.innerText = tag.innerText;
//     }

//     li.append(span);

//     // and replace original p tag.
//     tag.replaceWith(li);

//     // 3. Check p tags following li, if they are roman numerals,
//     // group and wrap them into separate ols, then an li
//     let nextItem = li.nextElementSibling;
//     const nestedGroup: HTMLParagraphElement[] = [];
//     while (nextItem && nextItem.tagName === "P") {
//       const paragraph = nextItem as HTMLParagraphElement;

//       // Check if the paragraph text represents a Roman numeral pattern
//       if (/^[ivxl]+\. /i.test(paragraph.innerText)) {
//         nestedGroup.push(paragraph);
//         nextItem = nextItem.nextElementSibling;
//       } else {
//         break; // Break the loop if the paragraph does not match the pattern
//       }
//     }

//     if (nestedGroup.length > 0) {
//       const nestedOl = dom.createElement("ol");
//       // Create list items and append them to the nested ordered list
//       nestedGroup.forEach((paragraph, index) => {
//         const li = document.createElement("li");
//         const strIndex = tag.innerText.indexOf(". ");

//         if (strIndex !== -1) {
//           // Set span.innerText to the substring starting from the position after the first period and space
//           li.innerText = tag.innerText.substring(strIndex + 2);
//         } else {
//           // If no period and space found, set span.innerText to the full text
//           li.innerText = tag.innerText;
//         }
//         // li.innerText = paragraph.innerText;
//         nestedOl.appendChild(li);
//         if (index !== 0) {
//           paragraph.remove();
//         }
//       });

//       const parentLi = dom.createElement("li");
//       parentLi.append(nestedOl);

//       // Replace the original paragraphs with the nested ordered list
//       nestedGroup[0].replaceWith(parentLi);
//     }
//   });

//   // Now we must group rogue lis into an ordered list, per area.
//   const rogueLiFirstElement = Array.from(dom.querySelectorAll("li")).filter(
//     (li) => {
//       if (
//         li.previousElementSibling &&
//         li.previousElementSibling.tagName !== "UL" &&
//         li.previousElementSibling.tagName !== "OL" &&
//         li.previousElementSibling.tagName !== "LI"
//       ) {
//         return true;
//       }
//     }
//   );

//   console.log("ROGUE LI Initial", rogueLiFirstElement);

//   const liGroups = [];
//   rogueLiFirstElement.forEach((li) => {
//     const group: HTMLLIElement[] = [];
//     group.push(li as HTMLLIElement);
//     let currentItem: HTMLElement | null = li;

//     while (currentItem && currentItem.nextElementSibling.tagName === "LI") {
//       currentItem = currentItem.nextElementSibling as HTMLElement;
//       group.push(currentItem as HTMLLIElement);
//     }
//     console.log(group);
//     liGroups.push(group);
//   });
//   console.log("ROGUE LI Groups", liGroups);

//   // 4. Now with 3rd level and second levels as lis,
//   // Find consecutive lis and group them as uls, then as an li

//   // For each group, create an ol, add copies of the items of the group, wrap it in in li
//   // and remove/replace originals

//   liGroups.forEach((group, index) => {
//     const ol = dom.createElement("ol");
//     const li = dom.createElement("li");

//     group.forEach((liItem, innerIndex) => {
//       const copy = (liItem as Element).cloneNode(true);
//       ol.append(copy);
//       if (innerIndex !== 0) {
//         (liItem as Element).remove();
//       }
//     });

//     li.append(ol);

//     group.forEach((liItem, innerIndex) => {
//       if (innerIndex === 0) {
//         (liItem as Element).replaceWith(li);
//       }
//     });
//   });

//   // 5. Next, search dom and convert p tags with ordinary numerals into lis.

//   const numeralPTags = Array.from(dom.querySelectorAll("p")).filter(
//     (pTag) => {
//       return /^[0-9]+\.\s/.test(pTag.innerText);
//     }
//   );
//   console.log("NUMERAL PTAGS", numeralPTags);

//   const finalLiGroups = [];
//   const processed = [];
//   numeralPTags.forEach((pTag) => {
//     const group: HTMLLIElement[] = [];
//     if (!processed.includes(pTag)) {
//       const li = dom.createElement("li");
//       li.innerText = pTag.innerText;
//       // const strIndex = pTag.innerText.indexOf(". ");

//       // if (strIndex !== -1) {
//       //   // Set span.innerText to the substring starting from the position after the first period and space
//       //   li.innerText = pTag.innerText.substring(strIndex + 2);
//       // } else {
//       //   // If no period and space found, set span.innerText to the full text
//       //   li.innerText = pTag.innerText;
//       // }
//       group.push(li);
//       processed.push(pTag);

//       let nextElement: null | Element = pTag.nextElementSibling;
//       while (nextElement) {
//         if (nextElement.tagName === "LI") {
//           nextElement = nextElement.nextElementSibling;
//         } else if (
//           numeralPTags.includes(nextElement as HTMLParagraphElement)
//         ) {
//           const clonedNextAsLi = dom.createElement("li");
//           clonedNextAsLi.innerText = (
//             nextElement as HTMLParagraphElement
//           ).innerText;

//           // const strIndex = (
//           //   nextElement as HTMLParagraphElement
//           // ).innerText.indexOf(". ");

//           // if (strIndex !== -1) {
//           //   // Set span.innerText to the substring starting from the position after the first period and space
//           //   clonedNextAsLi.innerText = pTag.innerText.substring(strIndex + 2);
//           // } else {
//           //   // If no period and space found, set span.innerText to the full text
//           //   clonedNextAsLi.innerText = pTag.innerText;
//           // }

//           if (!processed.includes(nextElement)) {
//             group.push(clonedNextAsLi);
//             processed.push(nextElement);
//             nextElement = nextElement.nextElementSibling;
//           }
//         } else {
//           break;
//         }
//       }

//       finalLiGroups.push(group);
//     }

//     // For each group
//     console.log("Final LI GROUPS:", finalLiGroups);

//     finalLiGroups.forEach((group, index) => {
//       group.forEach((liItem, innerIndex) => {
//         const copy = (liItem as HTMLLIElement).cloneNode(true);
//         // console.log("COPY", copy);

//         // Find the item after the ptag (should be li if appending)
//         const corresponding = Array.from(dom.querySelectorAll("p")).filter(
//           (p) => {
//             return liItem.innerText === p.innerText;
//           }
//         );
//         // console.log("CORRESPONDING", corresponding[0]);
//         if (corresponding.length > 0) {
//           const strIndex = (copy as HTMLParagraphElement).innerText.indexOf(
//             ". "
//           );

//           if (strIndex !== -1) {
//             // Set span.innerText to the substring starting from the position after the first period and space
//             (copy as HTMLLIElement).innerText = pTag.innerText.substring(
//               strIndex + 2
//             );
//           } else {
//             // If no period and space found, set span.innerText to the full text
//             (copy as HTMLLIElement).innerText = pTag.innerText;
//           }
//           corresponding[0].replaceWith(copy);
//         }

//       });
//     });
//   });

//   // Find groups of consecutive rogue lis
//   const finalRogues = Array.from(dom.querySelectorAll("li")).filter((li) => {
//     return (
//       li.parentElement.tagName !== "OL" && li.parentElement.tagName !== "UL"
//     );
//   });

//   const checked: Element[] | null = [];
//   const groups: Element[][] = [];
//   finalRogues.forEach((rogue) => {
//     const finalGroup: Element[] = [];
//     if (!checked.includes(rogue)) {
//       checked.push(rogue);
//     }
//     if (!finalGroup.includes(rogue)) {
//       finalGroup.push(rogue);
//     }
//     let nextItem: null | Element = (rogue as Element).nextElementSibling;
//     while (nextItem && nextItem.tagName === "LI") {
//       checked.push(nextItem);
//       finalGroup.push(nextItem);
//       nextItem = nextItem.nextElementSibling;
//     }

//     groups.push(finalGroup);
//   });

//   groups.forEach((group) => {
//     const ol = dom.createElement("ol");
//     group.forEach((liItem, index) => {
//       const copy = (liItem as Element).cloneNode(true);
//       ol.append(copy);
//       if (index === 0) {
//         (liItem as Element).replaceWith(ol);
//       } else {
//         liItem.remove();
//       }
//     });
//   });

//   // 6. Finally, we need to remove the original starter ol text from lis
//   // (all a. b. c. / i. ii. iii. iv. / 1. 2. 3. )

//   // console.log("DOM STATE", dom);
//   // // Get all lis within ols
//   // const liInOl = Array.from(dom.querySelectorAll("li")).filter((li) => {
//   //   return (
//   //     li.parentElement.tagName === "OL" &&
//   //     (li.firstChild as Element).tagName !== "OL"
//   //   );
//   // });
//   // const textLI = [];
//   // liInOl.forEach((i) => {
//   //   textLI.push(i.innerText);
//   // });
//   // console.log("LIIN OL", textLI);

//   // liInOl.forEach((li) => {
//   //   // const liSpan = li.querySelector("span");
//   //   if (li.querySelector("span")) {
//   //     const oldSpan = li.querySelector("span");
//   //     // console.log(oldSpan.innerText);
//   //     // Remove unwanted prefixes: numerals or lowercase letters followed by a period and a space
//   //     // const cleanedText = oldSpan.innerText.replace(
//   //     //   /^[0-9]+\. |^[ivxlcdm]+\.\s|^[a-z]\. /i,
//   //     //   ""
//   //     // );

//   //     const cleanedText = oldSpan.innerText.replace(
//   //       /^\d+\. |^[ivxlcdm]+\.\s|^[a-z]\. /i,
//   //       ""
//   //     );

//   //     const newSpan = dom.createElement("span");
//   //     newSpan.textContent = cleanedText;
//   //     newSpan.style.cssText = "white-space: pre-wrap;";
//   //     // newLi.append(newSpan);
//   //     oldSpan.replaceWith(newSpan);
//   //   }
//   //   console.log(li);
//   // });

//   console.log("Handled Dom", dom);

//   return dom.body.innerHTML;
// };
