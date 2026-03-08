import type { ReactElement } from "react";
import {
	DecoratorNode,
	type EditorConfig,
	type LexicalNode,
	type NodeKey,
	type SerializedLexicalNode,
	type Spread,
} from "lexical";
import { MentionComponent } from "./MentionComponent";

export type SerializedMentionNode = Spread<
	{
		userId: number;
		displayName: string;
		email: string;
	},
	SerializedLexicalNode
>;

/**
 * MentionNode - Custom Lexical node for user mentions in comments
 *
 * Represents a user mention with clickable functionality.
 * Stores user ID, display name, and email for notifications.
 */
export class MentionNode extends DecoratorNode<ReactElement> {
	__userId: number;
	__displayName: string;
	__email: string;

	static getType(): string {
		return "mention";
	}

	static clone(node: MentionNode): MentionNode {
		return new MentionNode(
			node.__userId,
			node.__displayName,
			node.__email,
			node.__key
		);
	}

	constructor(
		userId: number,
		displayName: string,
		email: string,
		key?: NodeKey
	) {
		super(key);
		this.__userId = userId;
		this.__displayName = displayName;
		this.__email = email;
	}

	createDOM(config: EditorConfig): HTMLElement {
		const span = document.createElement("span");
		span.className = config.theme.mention || "mention";
		span.setAttribute("data-lexical-mention", "true");
		span.setAttribute("data-user-id", String(this.__userId));
		span.setAttribute("data-display-name", this.__displayName);
		span.setAttribute("data-email", this.__email);
		// Don't set textContent - the DecoratorNode uses the React component (MentionComponent) to render
		return span;
	}

	updateDOM(): boolean {
		// Mentions are immutable, no updates needed
		return false;
	}

	exportDOM(): { element: HTMLElement } {
		// Export mention as HTML span with text content for HTML generation
		const span = document.createElement("span");
		span.className = "mention";
		span.setAttribute("data-user-id", String(this.__userId));
		span.setAttribute("data-display-name", this.__displayName);
		span.setAttribute("data-email", this.__email);
		span.textContent = `@${this.__displayName}`;
		return { element: span };
	}

	exportJSON(): SerializedMentionNode {
		return {
			userId: this.__userId,
			displayName: this.__displayName,
			email: this.__email,
			type: "mention",
			version: 1,
		};
	}

	static importJSON(serializedNode: SerializedMentionNode): MentionNode {
		return $createMentionNode(
			serializedNode.userId,
			serializedNode.displayName,
			serializedNode.email
		);
	}

	decorate(): ReactElement {
		return (
			<MentionComponent
				userId={this.__userId}
				displayName={this.__displayName}
				email={this.__email}
			/>
		);
	}

	getUserId(): number {
		return this.__userId;
	}

	getDisplayName(): string {
		return this.__displayName;
	}

	getEmail(): string {
		return this.__email;
	}
}

/**
 * Helper function to create a MentionNode
 */
export function $createMentionNode(
	data: { user_id: number; display_name: string; email: string } | number,
	displayName?: string,
	email?: string
): MentionNode {
	if (typeof data === "object") {
		return new MentionNode(data.user_id, data.display_name, data.email);
	}
	return new MentionNode(data, displayName!, email!);
}

/**
 * Type guard to check if a node is a MentionNode
 */
export function $isMentionNode(
	node: LexicalNode | null | undefined
): node is MentionNode {
	return node instanceof MentionNode;
}
