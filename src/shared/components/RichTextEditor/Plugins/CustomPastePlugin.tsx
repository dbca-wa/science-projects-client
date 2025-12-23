import {
	type BaseSelection,
	type CommandPayloadType,
	type LexicalCommand,
	type LexicalEditor,
	type LexicalNode,
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

import { useColorMode } from "@/shared/utils/theme.utils";
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
	const dom = parser.parseFromString(text, "text/html");
	const firstClass = "MsoListParagraphCxSpFirst";
	const middleClass = "MsoListParagraphCxSpMiddle";
	const endClass = "MsoListParagraphCxSpLast";
	const firstLevelRegex = /·\s*(<br\s*\/?>)?\s*/i;
	const secondLevelRegex = /o\s*(<br\s*\/?>)?\s*/i;
	const thirdLevelRegex = /§\s*(<br\s*\/?>)?\s*/i;

	const createListFromStartAndEndData = (
		arrayOfFirstClassPTags: Element[],
		dom: Document
	) => {
		for (const p of arrayOfFirstClassPTags) {
			// Create a list
			const ul = dom.createElement("ul");
			// Create an LI version of P tag
			const firstItemLi = dom.createElement("li");
			firstItemLi.textContent = p.textContent;
			// Create a group and append that li to it
			const listGroup = [];
			listGroup.push(firstItemLi);
			// Keep track of original processed items to remove/replace later
			const processed: Element[] = [];
			// Iterate over p tag's next items, adding them to the list until reaching end class (and when reaching, add it to list)
			let nextItem = p.nextElementSibling;
			while (
				nextItem !== null &&
				nextItem.tagName === "P" &&
				!processed.includes(nextItem) &&
				(nextItem.classList.contains(middleClass) ||
					nextItem.classList.contains(endClass))
			) {
				// Convert the item to an li
				const listVersion = dom.createElement("li");
				listVersion.innerText = (
					nextItem as HTMLParagraphElement
				).innerText;
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
			// use list to append to ul
			for (const item of listGroup) {
				ul.append(item);
			}
			// replace the original p tag (move to location) and delete the others
			p.replaceWith(ul);
			for (const pTag of processed) {
				pTag.remove();
			}
			// Create an array of list items in dom
			let listItems = Array.from(dom.querySelectorAll("li"));

			// Find consecutive Lis that have either o or § in them to create second level
			for (const li of listItems) {
				const processedItems: HTMLLIElement[] = [];
				const ulGroup: HTMLLIElement[] = [];
				let nextItem = li.nextElementSibling;
				while (
					nextItem !== null &&
					nextItem.tagName === "LI" &&
					(secondLevelRegex.test(nextItem.innerHTML) ||
						thirdLevelRegex.test(nextItem.innerHTML))
				) {
					ulGroup.push(nextItem as HTMLLIElement);
					processedItems.push(nextItem as HTMLLIElement);
					nextItem = nextItem.nextElementSibling;
				}

				const ulContainer = dom.createElement("ul");
				for (const liItem of ulGroup) {
					const clone = liItem.cloneNode(true);
					ulContainer.append(clone);
				}
				if (ulGroup.length > 1) {
					li.replaceWith(ulContainer);
					processedItems.forEach((li) => li.remove());
				}
			}
			// Find consecutive Lis to clean and begin third level
			listItems = Array.from(dom.querySelectorAll("li"));

			// Cleanup strange characters
			for (const li of listItems) {
				cleanListItem(li, firstLevelRegex);
				cleanListItem(li, secondLevelRegex);
			}

			const thirdLiItems = Array.from(dom.querySelectorAll("li")).filter(
				(li) => thirdLevelRegex.test(li.innerText)
			);
			for (const lastLi of thirdLiItems) {
				const lastLiProcessed: HTMLLIElement[] = [];
				const thirdUlGroup: HTMLLIElement[] = [];
				// lastLi doesnt need to be added to the group, because the group will replace it
				let nextItem = lastLi.nextElementSibling;
				while (
					nextItem !== null &&
					nextItem.tagName === "LI" &&
					thirdLevelRegex.test(nextItem.innerHTML)
				) {
					thirdUlGroup.push(nextItem as HTMLLIElement);
					lastLiProcessed.push(nextItem as HTMLLIElement);
					nextItem = nextItem.nextElementSibling;
				}

				const ulContainer = dom.createElement("ul");
				for (const liItem of thirdUlGroup) {
					const clone = liItem.cloneNode(true);
					ulContainer.append(clone);
				}
				if (thirdUlGroup.length > 1) {
					lastLi.replaceWith(ulContainer);
					lastLiProcessed.forEach((li) => li.remove());
				} else if (thirdUlGroup.length <= 1) {
					const subContainer = dom.createElement("ul");
					subContainer.append(lastLi.cloneNode(true));
					lastLi.replaceWith(subContainer);
				}
			}

			listItems = Array.from(dom.querySelectorAll("li"));
			for (const item of listItems) {
				cleanListItem(item, thirdLevelRegex);
			}
		}
		return dom;
	};

	const listStartPTags = Array.from(dom.querySelectorAll("p")).filter((p) => {
		if (p.classList.contains(firstClass)) {
			if (firstLevelRegex.test(p.innerHTML)) {
				return true;
			}
			return false;
		}

		return false;
	});

	const newDom = createListFromStartAndEndData(listStartPTags, dom);
	return newDom.body.innerHTML;
};

const convertOrdered = (text: string, colorMode) => {
	// Convert to DOM and establish classes to find
	const parser = new DOMParser();
	const dom = parser.parseFromString(text, "text/html");
	const firstClass = "MsoListParagraphCxSpFirst";
	const middleClass = "MsoListParagraphCxSpMiddle";
	const endClass = "MsoListParagraphCxSpLast";

	const firstLevelRegex = /^[0-9]\.\s*(<br\s*\/?>)?\s*/i;
	const secondLevelRegex = /^[a-z]\.\s*(<br\s*\/?>)?\s*/i;
	const thirdLevelRegex = /^[ivxl]+\.\s*(<br\s*\/?>)?\s*/i;

	const listStartPTags = Array.from(dom.querySelectorAll("p")).filter((p) => {
		if (p.classList.contains(firstClass)) {
			const span = p.querySelector("span");
			if (firstLevelRegex.test(span.innerText.trim())) {
				return true;
			}
		}
		return false;
	});

	const listEndPTags = Array.from(dom.querySelectorAll("p")).filter((p) => {
		if (p.classList.contains(middleClass)) {
			// /^[0-9]+\.\s*/i
			const span = p.querySelector("span");
			if (thirdLevelRegex.test(span.innerText.trim())) {
				return true;
			}
		}
		return false;
	});

	const handleThirdLevels = (
		arrayofThirdLevelPTags: Element[],
		dom: Document
	) => {
		// Establish ol list based on new dom
		const listOfOls: HTMLOListElement[] = Array.from(
			dom.querySelectorAll("ol")
		);

		// Establish list of any third levels that follow an ol ===================================
		const thirdGroups: HTMLParagraphElement[][] = [];
		for (const ol of listOfOls) {
			let next = ol.nextElementSibling;
			const l3Group: HTMLParagraphElement[] = [];
			const processed: HTMLParagraphElement[] = [];
			while (
				next !== null &&
				next.tagName === "P" &&
				!processed.includes(next as HTMLParagraphElement) &&
				thirdLevelRegex.test(
					(next as HTMLParagraphElement).innerText.trim()
				)
			) {
				next.innerHTML.trim();
				l3Group.push(next as HTMLParagraphElement);
				processed.push(next as HTMLParagraphElement);
				next = next.nextElementSibling;
			}
			if (l3Group.length > 0) {
				thirdGroups.push(l3Group);
			}
		}

		// Genereate list / list items for those and append consecutive ones to the list. ===================================
		for (const group of thirdGroups) {
			const containerLi = dom.createElement("li");
			const containerOl = dom.createElement("ol");

			// create li versions
			for (const pTag of group) {
				const liVersion = dom.createElement("li");
				liVersion.textContent = pTag.textContent;
				containerOl.append(liVersion);
			}
			containerLi.append(containerOl);
			// cleanup and replacement
			for (const pTag of group) {
				if (group[0] !== pTag) {
					pTag.remove();
				} else {
					pTag.replaceWith(containerLi);
				}
			}
			// Append that list to previous ol as an li > ol >CONTAINING LIST ITEMS ===================================
			containerLi.previousElementSibling.append(containerLi);
		}
		return dom;
	};

	const handleSecondLevels = (
		arrayofSecondLevelPTags: Element[],
		dom: Document
	) => {
		// HANDLE THIRD LEVEL ITEMS ==============================================================
		const processedTwos: HTMLParagraphElement[] = [];
		const twoGroups: HTMLParagraphElement[][] = [];
		for (const p of arrayofSecondLevelPTags) {
			const l2Group: HTMLParagraphElement[] = [];

			if (!processedTwos.includes(p as HTMLParagraphElement)) {
				// Check if previous element in array
				l2Group.push(p as HTMLParagraphElement);
				processedTwos.push(p as HTMLParagraphElement);
				let prev = p.previousElementSibling;

				while (
					prev !== null &&
					prev.tagName === "P" &&
					arrayofSecondLevelPTags.includes(prev) &&
					!processedTwos.includes(prev as HTMLParagraphElement)
				) {
					processedTwos.push(p as HTMLParagraphElement);
					prev = prev.previousElementSibling;
				}
				twoGroups.push(l2Group);
			}
		}
		for (const group of twoGroups) {
			const thirdLevelOlContainer = dom.createElement("ol");
			const newGroup = group.reverse();
			for (const pTag of newGroup) {
				// create li version
				const li = dom.createElement("li");
				li.textContent = pTag.innerText;
				thirdLevelOlContainer.append(li);
			}
			for (const itemToRemoveOrReplace of newGroup) {
				if (itemToRemoveOrReplace === newGroup[0]) {
					const lastIndex = group.length - 1;
					group[lastIndex].replaceWith(thirdLevelOlContainer);
				} else {
					itemToRemoveOrReplace.remove();
				}
			}
		}
		return dom;
	};

	const handleFirstLevels = (
		arrayofFirstLevelPTags: Element[],
		dom: Document
	) => {
		// Iterate over each list denoted by starterp
		for (const starterP of arrayofFirstLevelPTags) {
			// establish ending p
			const endingPTag: HTMLParagraphElement[] = [];
			let next = starterP.nextElementSibling;
			while (endingPTag.length < 1 && next !== null) {
				if (next.classList.contains(endClass)) {
					endingPTag.push(next as HTMLParagraphElement);
					break;
				}
				next = next.nextElementSibling;
			}
			const listEndElement = endingPTag[0];

			// Establish container and create a list of things to later to it
			const containerOl = dom.createElement("ol");
			const listItemsBeforeAddToOlContainer: Element[] = [];

			// With the start and end of the list established,
			// create lis for each item inbetween, inclusive of start and end elements
			const processedElements: Element[] = [];

			// Start =========
			const startListVer = dom.createElement("li");
			const startClone = (starterP as HTMLParagraphElement).cloneNode(
				true
			);
			startListVer.append(startClone);
			listItemsBeforeAddToOlContainer.push(startListVer);
			processedElements.push(starterP);

			// Middle =========
			let nextToConvert = starterP.nextElementSibling;
			while (nextToConvert !== null && nextToConvert !== listEndElement) {
				listItemsBeforeAddToOlContainer.push(nextToConvert);
				processedElements.push(nextToConvert);
				nextToConvert = nextToConvert.nextElementSibling;
			}

			// End =========
			const endListVer = dom.createElement("li");
			endListVer.append(
				(listEndElement as HTMLParagraphElement).cloneNode(true)
			);
			listItemsBeforeAddToOlContainer.push(endListVer);

			for (const listItem of listItemsBeforeAddToOlContainer) {
				if (listItem.tagName === "ol") {
					const wrapper = dom.createElement("li");
					wrapper.append(listItem);
					containerOl.append(wrapper);
				} else {
					containerOl.append(listItem);
				}
			}

			// Cleanup - remove and replace
			starterP.replaceWith(containerOl);
			listEndElement.remove();

			const domOlPs: Element[] = Array.from(
				dom.querySelectorAll("p")
			).filter((p) => {
				const parent = p.parentElement;
				if (
					parent.tagName === "OL" &&
					parent.parentElement !== null &&
					parent.parentElement.tagName === "BODY"
				) {
					return true;
				}
				return false;
			});

			// Convert ptags belong to OL to li
			for (const pLi of domOlPs) {
				const liVer = dom.createElement("li");
				const newInnerText = (
					pLi as HTMLParagraphElement
				).innerText.trim();
				liVer.innerText = newInnerText;
				pLi.replaceWith(liVer);
			}

			const domOlLis: Element[] = Array.from(
				dom.querySelectorAll("li")
			).filter((li) => {
				const parent = li.parentElement;
				if (
					parent.tagName === "OL" &&
					parent.parentElement !== null &&
					parent.parentElement.tagName === "BODY"
				) {
					return true;
				}
				return false;
			});

			// Clean paragraphs
			for (const item of domOlLis) {
				if ((item.firstChild as Element).tagName === "P") {
					const li = dom.createElement("li");
					li.innerText = (
						item.firstChild as HTMLParagraphElement
					).innerText.trim();
					item.replaceWith(li);
				}
			}

			// wrap ols that are in ols with an li
			const insideOlOl = Array.from(dom.querySelectorAll("ol")).filter(
				(ol) => ol.parentElement.tagName === "OL"
			);
			for (const item of insideOlOl) {
				const clone = (item as HTMLOListElement).cloneNode(true);
				const cloneWrapper = dom.createElement("li");
				cloneWrapper.append(clone);
				item.replaceWith(cloneWrapper);
			}

			const liInOl = Array.from(dom.querySelectorAll("li")).filter(
				(li) => li.parentElement.tagName === "OL"
			);
			console.log("LATEST DOM", dom);
			for (const li of liInOl) {
				if (firstLevelRegex.test(li.innerHTML)) {
					cleanListItem(li, firstLevelRegex);
				}
				if (thirdLevelRegex.test(li.innerHTML.trim())) {
					const replacement = dom.createElement("li");
					replacement.innerHTML = li.innerHTML
						.trim()
						.replace(thirdLevelRegex, "");
					li.replaceWith(replacement);
				}

				if (secondLevelRegex.test(li.innerHTML.trim())) {
					const replacement = dom.createElement("li");
					replacement.innerHTML = li.innerHTML
						.trim()
						.replace(secondLevelRegex, "");
					li.replaceWith(replacement);
				}
			}
		}
		return dom;
	};

	const listMiddlePTags = Array.from(dom.querySelectorAll("p")).filter(
		(p) => {
			if (p.classList.contains(middleClass)) {
				const span = p.querySelector("span");
				if (secondLevelRegex.test(span.innerText.trim())) {
					const text = p.innerText.trim();
					const prevSib = p.previousElementSibling;

					if (
						text?.startsWith("i.") &&
						prevSib &&
						!(prevSib as HTMLElement).innerText
							.trim()
							?.startsWith("h.")
					) {
						return false;
					}
					return true;
				}
			}
			return false;
		}
	);

	const moveRoguesToLastOL = (dom: Document) => {
		// find ols
		const rogues: HTMLOListElement[] = Array.from(
			dom.querySelectorAll("ol")
		);

		// if previous item is an ol, append children to that ol
		for (const rogue of rogues) {
			const prevItem = rogue.previousElementSibling;
			if (prevItem !== null) {
				// console.log("HERE RRR")
				if ((prevItem as Element).tagName === "OL") {
					for (const item of rogue.childNodes) {
						prevItem.appendChild(item);
					}
					rogue.remove();
				}
			}
		}
		return dom;
	};

	let newDom = handleSecondLevels(listMiddlePTags, dom);
	newDom = handleThirdLevels(listEndPTags, newDom);
	const roguesRemoved = moveRoguesToLastOL(newDom);
	newDom = handleFirstLevels(listStartPTags, roguesRemoved);
	return newDom.body.innerHTML;
};

// HELPER FUNCTIONS =====================================================================

const removeHTMLSpace = (text: string) => {
	return text.replace(/&nbsp;/g, " ");
};

const cleanListItem = (li: Element, regex: RegExp) => {
	// Replace the matched pattern with an empty string
	li.innerHTML = li.innerHTML.replace(regex, "");

	// Strip leading and trailing whitespace from the remaining text content
	li.innerHTML = li.innerHTML.trim();
};

const handlePastedWordUnorderedList = (text: string, colorMode: string) => {
	const unorderedCleaned = convertUnordered(text, colorMode);
	// return text;
	return unorderedCleaned;
};

const handlePastedWordOrderedList = (text: string, colorMode: string) => {
	const orderedCleaned = convertOrdered(text, colorMode);
	return orderedCleaned;
};

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
			const unorderedHandled = handlePastedWordUnorderedList(
				withoutNbsp,
				colorMode
			);
			const orderedHandled = handlePastedWordOrderedList(
				unorderedHandled,
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
