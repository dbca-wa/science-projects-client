/**
 * ImageNode for Lexical Editor
 *
 * A decorator node that renders an image with resize handles,
 * alignment controls, and a delete button when selected.
 */
import type {
	DOMConversionMap,
	DOMConversionOutput,
	DOMExportOutput,
	EditorConfig,
	LexicalEditor,
	LexicalNode,
	NodeKey,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import { DecoratorNode, $getNodeByKey } from "lexical";
import type { ReactNode } from "react";
import { ImageComponent } from "./ImageComponent";

export type ImageAlignment = "left" | "center" | "right" | "full";

export interface ImagePayload {
	src: string;
	altText: string;
	width?: string;
	alignment?: ImageAlignment;
	key?: NodeKey;
}

export type SerializedImageNode = Spread<
	{
		src: string;
		altText: string;
		width: string;
		alignment: ImageAlignment;
	},
	SerializedLexicalNode
>;

function convertImageElement(domNode: Node): DOMConversionOutput | null {
	if (domNode instanceof HTMLImageElement) {
		const { src, alt: altText } = domNode;
		const width = domNode.style.width || "100%";
		const alignment =
			(domNode.getAttribute("data-alignment") as ImageAlignment) || "center";
		const node = $createImageNode({ src, altText, width, alignment });
		return { node };
	}
	return null;
}

/** Alignment → CSS style mapping */
function getAlignmentStyles(alignment: ImageAlignment, width: string): string {
	const base = `width:${width};max-width:100%;border-radius:8px;`;
	switch (alignment) {
		case "left":
			return `${base}float:left;margin-right:16px;margin-bottom:8px;`;
		case "right":
			return `${base}float:right;margin-left:16px;margin-bottom:8px;`;
		case "full":
			return `width:100%;max-width:100%;border-radius:8px;display:block;margin:8px 0;`;
		case "center":
		default:
			return `${base}display:block;margin:8px auto;`;
	}
}

export class ImageNode extends DecoratorNode<ReactNode> {
	__src: string;
	__altText: string;
	__width: string;
	__alignment: ImageAlignment;

	static getType(): string {
		return "image";
	}

	static clone(node: ImageNode): ImageNode {
		return new ImageNode(
			node.__src,
			node.__altText,
			node.__width,
			node.__alignment,
			node.__key
		);
	}

	static importJSON(serializedNode: SerializedImageNode): ImageNode {
		return $createImageNode({
			src: serializedNode.src,
			altText: serializedNode.altText,
			width: serializedNode.width,
			alignment: serializedNode.alignment,
		});
	}

	static importDOM(): DOMConversionMap | null {
		return {
			img: () => ({
				conversion: convertImageElement,
				priority: 0,
			}),
		};
	}

	constructor(
		src: string,
		altText: string,
		width: string = "100%",
		alignment: ImageAlignment = "center",
		key?: NodeKey
	) {
		super(key);
		this.__src = src;
		this.__altText = altText;
		this.__width = width;
		this.__alignment = alignment;
	}

	exportJSON(): SerializedImageNode {
		return {
			type: "image",
			version: 1,
			src: this.__src,
			altText: this.__altText,
			width: this.__width,
			alignment: this.__alignment,
		};
	}

	exportDOM(): DOMExportOutput {
		const img = document.createElement("img");
		img.setAttribute("src", this.__src);
		img.setAttribute("alt", this.__altText);
		img.setAttribute("data-alignment", this.__alignment);
		img.setAttribute(
			"style",
			getAlignmentStyles(this.__alignment, this.__width)
		);
		return { element: img };
	}

	createDOM(_config: EditorConfig): HTMLElement {
		const span = document.createElement("span");
		span.style.display = "block";
		span.style.clear = "both";
		return span;
	}

	updateDOM(): false {
		return false;
	}

	setWidth(width: string): void {
		const writable = this.getWritable();
		writable.__width = width;
	}

	setAlignment(alignment: ImageAlignment): void {
		const writable = this.getWritable();
		writable.__alignment = alignment;
	}

	decorate(_editor: LexicalEditor): ReactNode {
		return (
			<ImageComponent
				src={this.__src}
				altText={this.__altText}
				width={this.__width}
				alignment={this.__alignment}
				nodeKey={this.__key}
			/>
		);
	}
}

export function $createImageNode({
	src,
	altText,
	width,
	alignment,
}: ImagePayload): ImageNode {
	return new ImageNode(src, altText, width ?? "100%", alignment ?? "center");
}

export function $isImageNode(
	node: LexicalNode | null | undefined
): node is ImageNode {
	return node instanceof ImageNode;
}

/** Helper to update an ImageNode's properties from outside the node */
export function $updateImageNode(
	nodeKey: string,
	updates: { width?: string; alignment?: ImageAlignment }
): void {
	const node = $getNodeByKey(nodeKey);
	if ($isImageNode(node)) {
		if (updates.width !== undefined) node.setWidth(updates.width);
		if (updates.alignment !== undefined) node.setAlignment(updates.alignment);
	}
}
