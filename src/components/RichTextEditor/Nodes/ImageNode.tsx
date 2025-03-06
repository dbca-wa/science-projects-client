// ImageNode.tsx - Fixed implementation
import type {
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { $applyNodeReplacement, DecoratorNode } from "lexical";
import * as React from "react";

export type SerializedImageNode = Spread<
  {
    altText: string;
    src: string;
    width?: number;
    height?: number;
  },
  SerializedLexicalNode
>;

export type ImagePayload = {
  altText: string;
  src: string;
  width?: number;
  height?: number;
  key?: NodeKey;
};

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number | undefined;
  __height: number | undefined;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  constructor(
    src: string,
    altText: string,
    width?: number,
    height?: number,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: this.getType(),
      altText: this.__altText,
      src: this.__src,
      width: this.__width,
      height: this.__height,
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, src, width, height } = serializedNode;
    return $createImageNode({
      altText,
      height,
      src,
      width,
    });
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    if (this.__width) element.setAttribute("width", this.__width.toString());
    if (this.__height) element.setAttribute("height", this.__height.toString());
    element.style.maxWidth = "100%";
    element.style.height = "auto";
    return { element };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const className = config.theme.image;
    if (className) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  getWidth(): number | undefined {
    return this.__width;
  }

  getHeight(): number | undefined {
    return this.__height;
  }

  setWidthAndHeight(width?: number, height?: number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  // Safe image rendering with error handling
  decorate(): JSX.Element {
    return (
      <span className="image-container">
        <img
          src={this.__src}
          alt={this.__altText}
          width={this.__width}
          height={this.__height}
          style={{
            display: "block",
            maxWidth: "100%",
            height: "auto",
            margin: "0 auto",
            cursor: "default",
          }}
          draggable="false"
          onError={(e) => {
            // Handle image loading errors
            console.warn("Image failed to load:", this.__src);
            e.currentTarget.style.display = "none";
          }}
        />
      </span>
    );
  }
}

export function $createImageNode({
  altText,
  src,
  width,
  height,
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, width, height, key));
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
