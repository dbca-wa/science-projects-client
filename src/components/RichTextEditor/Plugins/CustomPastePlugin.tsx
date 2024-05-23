import {
  BaseSelection,
  CommandPayloadType,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  TextNode,
} from "lexical";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  // $INTERNAL_isPointSelection,
  $getSelection,
  $isTextNode,
  $parseSerializedNode,
  COMMAND_PRIORITY_CRITICAL,
  PASTE_COMMAND,
  createCommand,
} from "lexical";

import { useColorMode } from "@chakra-ui/react";
import { $generateNodesFromDOM } from "@lexical/html";
import { useEffect } from "react";

// MISC ==============================================================================================================
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
    // console.log("NODES:");
    // console.log(nodes);
    selection.insertNodes(nodes);
  }
  return;
}

// =======================================================================
//  List Functions =======================================================

// •
// o
// 

// eslint-disable-next-line
// with tab 'o ' - irregular whitespace
// with space 'o '

const convertUnordered = (text: string, colorMode) => {
  // Convert to DOM and establish classes to find
  const parser = new DOMParser();
  const dom = parser.parseFromString(text, 'text/html')
  const firstClass = 'MsoListParagraphCxSpFirst';
  const middleClass = 'MsoListParagraphCxSpMiddle';
  const endClass = 'MsoListParagraphCxSpLast';
  const firstLevelRegex = /·\s*(<br\s*\/?>)?\s*/i
  const secondLevelRegex = /o\s*(<br\s*\/?>)?\s*/i
  const thirdLevelRegex = /§\s*(<br\s*\/?>)?\s*/i

  const createListFromStartAndEndData = (arrayOfFirstClassPTags: Element[], dom: Document) => {
    for (const p of arrayOfFirstClassPTags) {
      console.log(p)
      // Create a list
      const ul = dom.createElement("ul");
      // Create an LI version of P tag
      const firstItemLi = dom.createElement("li");
      firstItemLi.textContent = p.textContent
      // Create a group and append that li to it
      const listGroup = []
      listGroup.push(firstItemLi)
      // Keep track of original processed items to remove/replace later
      const processed: Element[] = []
      // processed.push(p);
      // Iterate over p tag's next items, adding them to the list until reaching end class (and when reaching, add it to list)
      let nextItem = p.nextElementSibling;
      while (
        nextItem !== null && nextItem.tagName === "P" &&
        !processed.includes(nextItem) && (nextItem.classList.contains(middleClass) || nextItem.classList.contains(endClass))
      ) {
        // Convert the item to an li
        const listVersion = dom.createElement("li");
        listVersion.innerText = (nextItem as HTMLParagraphElement).innerText;
        console.log(listVersion)
        // Add it to the list
        listGroup.push(listVersion);
        // Add original to processed
        processed.push(nextItem);
        // Break if list item contains endclass
        if (nextItem.classList.contains(endClass)) {
          break;
        }
        // Otherwise set the nextItem to its sibling
        else {
          nextItem = nextItem.nextElementSibling;
        }
      }
      // console.log(listGroup)
      // use list to append to ul
      for (const item of listGroup) {
        ul.append(item);
      }
      // replace the original p tag (move to location) and delete the others
      p.replaceWith(ul);
      for (const pTag of processed) {
        (pTag).remove();
      }
      // Create an array of list items in dom
      let listItems = Array.from(dom.querySelectorAll('li'))

      // Find consecutive Lis that have either o or § in them to create second level
      for (const li of listItems) {
        const processedItems: HTMLLIElement[] = [];
        const ulGroup: HTMLLIElement[] = []
        let nextItem = li.nextElementSibling;
        while (
          nextItem !== null && nextItem.tagName === "LI" &&
          (secondLevelRegex.test(nextItem.innerHTML) || thirdLevelRegex.test(nextItem.innerHTML))
        ) {
          ulGroup.push(nextItem as HTMLLIElement);
          processedItems.push(nextItem as HTMLLIElement);
          nextItem = nextItem.nextElementSibling;
        }

        const ulContainer = dom.createElement("ul");
        for (const liItem of ulGroup) {
          const clone = liItem.cloneNode(true)
          ulContainer.append(clone)
        }
        if (ulGroup.length > 1) {
          li.replaceWith(ulContainer)
          processedItems.forEach((li) => li.remove());
        }
        // else if (ulGroup.length <= 1) {
        //   const subContainer = dom.createElement('ul');
        //   subContainer.append(li.cloneNode(true))
        //   li.replaceWith(subContainer);
        // }
      }
      // Find consecutive Lis to clean and begin third level
      listItems = Array.from(dom.querySelectorAll('li'))

      // Cleanup strange characters
      for (const li of listItems) {
        cleanListItem(li, firstLevelRegex)
        cleanListItem(li, secondLevelRegex)
      }

      const thirdLiItems = Array.from(dom.querySelectorAll('li')).filter((li) => thirdLevelRegex.test(li.innerText))
      for (const lastLi of thirdLiItems) {
        const lastLiProcessed: HTMLLIElement[] = [];
        const thirdUlGroup: HTMLLIElement[] = []
        // lastLi doesnt need to be added to the group, because the group will replace it
        let nextItem = lastLi.nextElementSibling;
        while (
          nextItem !== null && nextItem.tagName === "LI" &&
          (thirdLevelRegex.test(nextItem.innerHTML))
        ) {
          thirdUlGroup.push(nextItem as HTMLLIElement);
          lastLiProcessed.push(nextItem as HTMLLIElement);
          nextItem = nextItem.nextElementSibling;
        }

        const ulContainer = dom.createElement("ul");
        for (const liItem of thirdUlGroup) {
          const clone = liItem.cloneNode(true)
          ulContainer.append(clone)
        }
        if (thirdUlGroup.length > 1) {
          lastLi.replaceWith(ulContainer)
          lastLiProcessed.forEach((li) => li.remove());
        }
        else if (thirdUlGroup.length <= 1) {
          const subContainer = dom.createElement('ul');
          subContainer.append(lastLi.cloneNode(true))
          lastLi.replaceWith(subContainer);
        }
      }

      listItems = Array.from(dom.querySelectorAll('li'))
      for (const item of listItems) {
        cleanListItem(item, thirdLevelRegex)
      }

    }
    console.log(dom.body)
    return dom;
  }

  const listStartPTags = Array.from(dom.querySelectorAll("p")).filter((p) => {
    if (p.classList.contains(firstClass)) {
      if (firstLevelRegex.test(p.innerHTML)) {
        const text = p.innerText;
        console.log(text)
        return true
      }
      return false;
    }

    return false
  })
  const newDom = createListFromStartAndEndData(listStartPTags, dom);
  return newDom.body.innerHTML;
};


const convertOrdered = (text: string, colorMode) => {
  // Convert to DOM and establish classes to find
  const parser = new DOMParser();
  const dom = parser.parseFromString(text, 'text/html')
  const firstClass = 'MsoListParagraphCxSpFirst';
  const middleClass = 'MsoListParagraphCxSpMiddle';
  const endClass = 'MsoListParagraphCxSpLast';

  // const firstLevelRegex = /·\s*(<br\s*\/?>)?\s*/i
  // const secondLevelRegex = /o\s*(<br\s*\/?>)?\s*/i
  // const thirdLevelRegex = /§\s*(<br\s*\/?>)?\s*/i

  const firstLevelRegex = /^[0-9]\.\s*(<br\s*\/?>)?\s*/i;
  const secondLevelRegex = /^[a-z]\.\s*(<br\s*\/?>)?\s*/i;
  // const thirdLevelRegex = /^[ivxl]\.\s*(<br\s*\/?>)?\s*/i;
  const thirdLevelRegex = /^[ivxl]+\.\s*(<br\s*\/?>)?\s*/i;

  const createListFromStartAndEndData = (arrayOfFirstClassPTags: Element[], dom: Document) => {

    for (const p of arrayOfFirstClassPTags) {
      // PART 1 - CREATING FIRST LIST FOR EACH START P TAG ==================================

      // Create a list whiwh will serve as the main container
      const ol = dom.createElement("ol");
      // Create an LI version of the first p tag
      const firstItemLi = dom.createElement("li");
      firstItemLi.textContent = p.textContent.trim()
      // Create a group and append that li to it
      const listGroup = []
      listGroup.push(firstItemLi)
      // Keep track of original processed items to remove/replace later
      const processed: Element[] = []
      // Iterate over p tag's next items, adding them to the list until reaching end class (and when reaching, add it to list)
      let nextItem = p.nextElementSibling;
      while (
        // Ensure it is a p tag
        nextItem !== null && nextItem.tagName === "P"
        // Ensure that the p tag is a part of the list by making sure it has middle or end class
        &&
        (nextItem.classList.contains(middleClass) || nextItem.classList.contains(endClass))
        // Ensure it isnt handled already
        &&
        !processed.includes(nextItem)
      ) {
        // If we are here, it means it is an item that belongs to the list IN SOME CAPACITY.
        // Add original to processed
        processed.push(nextItem);

        // Convert the item to an li
        const itemBeingHandled = nextItem;

        const listVersion = dom.createElement("li");
        listVersion.innerText = (itemBeingHandled as HTMLParagraphElement).innerText.trim();

        // Add it to the list
        listGroup.push(listVersion);

        // Establish next item for iteration
        nextItem = itemBeingHandled.nextElementSibling;
      }
      console.log("GROUP:\n\n", listGroup)



      // use list to append to ul
      for (const item of listGroup) {
        ol.append(item);
      }
      // replace the original p tag (move to location) and delete the others
      p.replaceWith(ol);
      for (const pTag of processed) {
        (pTag).remove();
      }

      // PART 2 - CREATING TERTIARY LISTS ==================================

      // Create an array of list items from the newly created ol
      const listItemsInOL = Array.from(ol.querySelectorAll('li'))
      console.log("LIST ITEMS IN OL\n", listItemsInOL)

      // Find consecutive Lis that have roman numerals 
      const liSubGroup: HTMLLIElement[][] = []
      const processedOnes = []
      const levelThreeGroups: HTMLElement[][] = []
      for (const liItem of listItemsInOL) {
        if (!processedOnes.includes(liItem)) {
          const thirdGroup = []
          // processedOnes.push(liItem)
          let current: Element = liItem;
          while (current !== null && current.tagName === "LI" && thirdLevelRegex.test(((current as HTMLLIElement)).innerText)) {
            processedOnes.push(current);
            thirdGroup.push(current)
            current = current.nextElementSibling;
            console.log("Next", current)
          }
          if (thirdGroup.length >= 1) {
            levelThreeGroups.push(thirdGroup)
          }
        }
      }
      console.log("THREE GROUPS\n", levelThreeGroups)

      // replace and delete l3s
      for (const threeGroup of levelThreeGroups) {
        const holder = dom.createElement("li")
        const cont = dom.createElement("ol")
        for (const li of threeGroup) {
          cont.append(li.cloneNode(true));
          if (threeGroup[0] !== li) {
            li.remove()
          }
        }
        holder.append(cont)
        threeGroup[0].replaceWith(holder)
        console.log(holder)
      }


      // PART 3 - CREATING SECONDARY LISTS ==================================




      // // collect the group


      //   thirdGroup.push(liItem)
      //   let next = liItem.nextElementSibling;
      //   while (next !== null && next.tagName === "LI" && (secondLevelRegex.test(next.innerHTML) || thirdLevelRegex.test(next.innerHTML))) {

      //     processed.push(next);
      //     secondAndThirdsGroup.push(next);
      //     next = next.nextElementSibling;
      //   }
      //   liSubGroup.push(secondAndThirdsGroup)
      // }
      // }
      // }


      // PART 3 - FINAL LSIT ==================================
      // // Find consecutive Lis to clean and begin third level
      // listItems = Array.from(dom.querySelectorAll('li'))

      // // Cleanup strange characters
      // for (const li of listItems) {
      //   cleanListItem(li, firstLevelRegex)
      //   cleanListItem(li, secondLevelRegex)
      // }

      // const thirdLiItems = Array.from(dom.querySelectorAll('li')).filter((li) => thirdLevelRegex.test(li.innerText))
      // for (const lastLi of thirdLiItems) {
      //   const lastLiProcessed: HTMLLIElement[] = [];
      //   const thirdOlGroup: HTMLLIElement[] = []
      //   // lastLi doesnt need to be added to the group, because the group will replace it
      //   let nextItem = lastLi.nextElementSibling;
      //   while (
      //     nextItem !== null && nextItem.tagName === "LI" &&
      //     (thirdLevelRegex.test(nextItem.innerHTML))
      //   ) {
      //     thirdOlGroup.push(nextItem as HTMLLIElement);
      //     lastLiProcessed.push(nextItem as HTMLLIElement);
      //     nextItem = nextItem.nextElementSibling;
      //   }

      //   const ulContainer = dom.createElement("ol");
      //   for (const liItem of thirdOlGroup) {
      //     const clone = liItem.cloneNode(true)
      //     ulContainer.append(clone)
      //   }
      //   if (thirdOlGroup.length > 1) {
      //     lastLi.replaceWith(ulContainer)
      //     lastLiProcessed.forEach((li) => li.remove());
      //   }
      //   else if (thirdOlGroup.length <= 1) {
      //     const subContainer = dom.createElement('ol');
      //     subContainer.append(lastLi.cloneNode(true))
      //     lastLi.replaceWith(subContainer);
      //   }
      // }

      // listItems = Array.from(dom.querySelectorAll('li'))
      // for (const item of listItems) {
      //   cleanListItem(item, thirdLevelRegex)
      // }

    }
    // console.log(dom.body)
    return dom;
  }


  const listStartPTags = Array.from(dom.querySelectorAll("p")).filter((p) => {
    if (p.classList.contains(firstClass)) {
      // /^[0-9]+\.\s*/i
      const span = p.querySelector('span')
      if (firstLevelRegex.test(span.innerText.trim())) {
        const text = p.innerText;
        console.log(text);
        return true;
      }
    }
    return false
  })

  console.log(text)
  console.log(listStartPTags)
  const newDom = createListFromStartAndEndData(listStartPTags, dom);
  return newDom.body.innerHTML;
};



// HELPER FUNCTIONS =====================================================================

const removeHTMLSpace = (text: string) => {
  return text.replace(/&nbsp;/g, " ");
};

const cleanListItem = (li: HTMLLIElement, regex: RegExp) => {
  // Replace the matched pattern with an empty string
  li.innerHTML = li.innerHTML.replace(regex, '');

  // Strip leading and trailing whitespace from the remaining text content
  li.innerHTML = li.innerHTML.trim();
}

// const handlePastedWordUnorderedList = (text: string, colorMode: string) => {
//   const unorderedCleaned = convertUnordered(text, colorMode);
//   return unorderedCleaned;
// };

const handlePastedWordOrderedList = (text: string, colorMode: string) => {
  const orderedCleaned = convertOrdered(text, colorMode);
  return orderedCleaned;
}

// =====================================================================
//  Main Functions =======================================================

function $insertDataTransferForRichText(
  colorMode: string,
  dataTransfer: DataTransfer,
  selection: BaseSelection,
  editor: LexicalEditor
): void {
  const htmlString = dataTransfer.getData("text/html");

  if (htmlString) {
    try {
      const withoutNbsp = removeHTMLSpace(htmlString);
      const orderedHandled = handlePastedWordOrderedList(
        withoutNbsp,
        colorMode
      );
      const parser = new DOMParser();
      const dom = parser.parseFromString(orderedHandled, "text/html");
      return generateNodesFromDom(dom, editor, selection);
    } catch (e) {
      // Fail silently.
      console.log("ERROR", e);
    }
  }
}

const generateNodesFromDom = (dom: Document, editor, selection) => {
  const nodes = $generateNodesFromDOM(editor, dom);
  // console.log(nodes);
  return $insertGeneratedNodes(editor, nodes, selection);
};


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
      if (clipboardData != null && selection !== null) {
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
          if (
            clipboardData !== null &&
            selection
            // && $INTERNAL_isPointSelection(selection)
          ) {
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
