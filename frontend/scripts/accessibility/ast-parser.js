/**
 * AST Parser for React/TypeScript Files
 *
 * Parses React components using Babel to extract JSX structure,
 * element types, attributes, and component hierarchy for accessibility analysis.
 */

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { readFileSync } from "fs";

/**
 * Parse a React/TypeScript file and extract JSX elements
 */
export function parseFile(filePath) {
	try {
		const content = readFileSync(filePath, "utf-8");
		return parseCode(content, filePath);
	} catch (error) {
		console.error(`Error parsing ${filePath}:`, error.message);
		return null;
	}
}

/**
 * Parse React/TypeScript code and extract JSX elements
 */
export function parseCode(code, filePath = "unknown") {
	try {
		const ast = parse(code, {
			sourceType: "module",
			plugins: ["jsx", "typescript", "classProperties", "decorators-legacy"],
		});

		const elements = [];
		const components = [];
		const headings = [];
		const landmarks = new Set();

		traverse.default(ast, {
			JSXElement(path) {
				const element = extractElementInfo(path, filePath);
				if (element) {
					elements.push(element);

					// Track headings
					if (element.type.match(/^h[1-6]$/i)) {
						headings.push(element);
					}

					// Track landmark elements
					if (
						[
							"header",
							"nav",
							"main",
							"aside",
							"footer",
							"section",
							"article",
						].includes(element.type.toLowerCase())
					) {
						landmarks.add(element.type.toLowerCase());
					}
				}
			},

			FunctionDeclaration(path) {
				if (isReactComponent(path.node)) {
					components.push({
						name: path.node.id?.name || "Anonymous",
						type: "function",
						line: path.node.loc?.start.line,
					});
				}
			},

			VariableDeclarator(path) {
				if (isReactComponent(path.node.init)) {
					components.push({
						name: path.node.id?.name || "Anonymous",
						type: "arrow",
						line: path.node.loc?.start.line,
					});
				}
			},
		});

		return {
			filePath,
			elements,
			components,
			headings,
			landmarks: Array.from(landmarks),
			ast,
		};
	} catch (error) {
		console.error(`Error parsing code:`, error.message);
		return null;
	}
}

/**
 * Extract information from a JSX element
 */
function extractElementInfo(path, filePath) {
	const node = path.node;
	const openingElement = node.openingElement;

	if (!openingElement) return null;

	const elementType = getElementType(openingElement);
	const attributes = extractAttributes(openingElement);
	const line = openingElement.loc?.start.line;

	return {
		type: elementType,
		attributes,
		line,
		filePath,
		hasChildren: node.children && node.children.length > 0,
		selfClosing: openingElement.selfClosing,
	};
}

/**
 * Get the element type (e.g., 'div', 'button', 'MyComponent')
 */
function getElementType(openingElement) {
	const name = openingElement.name;

	if (t.isJSXIdentifier(name)) {
		return name.name;
	}

	if (t.isJSXMemberExpression(name)) {
		// Handle cases like <Dialog.Content>
		return `${name.object.name}.${name.property.name}`;
	}

	return "unknown";
}

/**
 * Extract attributes from a JSX element
 */
function extractAttributes(openingElement) {
	const attributes = {};

	openingElement.attributes.forEach((attr) => {
		if (t.isJSXAttribute(attr)) {
			const name = attr.name.name;
			const value = getAttributeValue(attr.value);
			attributes[name] = value;
		} else if (t.isJSXSpreadAttribute(attr)) {
			attributes["...spread"] = true;
		}
	});

	return attributes;
}

/**
 * Get the value of a JSX attribute
 */
function getAttributeValue(value) {
	if (!value) return true; // Boolean attribute like <input disabled />

	if (t.isStringLiteral(value)) {
		return value.value;
	}

	if (t.isJSXExpressionContainer(value)) {
		const expression = value.expression;

		if (t.isStringLiteral(expression)) {
			return expression.value;
		}

		if (t.isBooleanLiteral(expression)) {
			return expression.value;
		}

		if (t.isNumericLiteral(expression)) {
			return expression.value;
		}

		// For complex expressions, return a placeholder
		return "{expression}";
	}

	return null;
}

/**
 * Check if a node is a React component
 */
function isReactComponent(node) {
	if (!node) return false;

	// Function component
	if (t.isFunctionDeclaration(node) || t.isFunctionExpression(node)) {
		return hasJSXReturn(node);
	}

	// Arrow function component
	if (t.isArrowFunctionExpression(node)) {
		return hasJSXReturn(node);
	}

	return false;
}

/**
 * Check if a function returns JSX
 */
function hasJSXReturn(node) {
	let hasJSX = false;

	traverse.default(
		node,
		{
			ReturnStatement(path) {
				if (path.node.argument && t.isJSXElement(path.node.argument)) {
					hasJSX = true;
					path.stop();
				}
			},
			JSXElement(path) {
				hasJSX = true;
				path.stop();
			},
		},
		null,
		{}
	);

	return hasJSX;
}

/**
 * Find elements matching a predicate
 */
export function findElements(parseResult, predicate) {
	if (!parseResult || !parseResult.elements) return [];
	return parseResult.elements.filter(predicate);
}

/**
 * Find elements by type
 */
export function findElementsByType(parseResult, type) {
	return findElements(
		parseResult,
		(el) => el.type.toLowerCase() === type.toLowerCase()
	);
}

/**
 * Find elements with specific attribute
 */
export function findElementsWithAttribute(parseResult, attributeName) {
	return findElements(parseResult, (el) => attributeName in el.attributes);
}

/**
 * Find elements with onClick but no role
 */
export function findInteractiveDivsWithoutRole(parseResult) {
	return findElements(parseResult, (el) => {
		const isDivOrSpan = ["div", "span"].includes(el.type.toLowerCase());
		const hasOnClick = "onClick" in el.attributes;
		const hasRole = "role" in el.attributes;
		return isDivOrSpan && hasOnClick && !hasRole;
	});
}

/**
 * Find inputs without labels
 */
export function findInputsWithoutLabels(parseResult) {
	return findElements(parseResult, (el) => {
		const isInput = ["input", "select", "textarea"].includes(
			el.type.toLowerCase()
		);
		if (!isInput) return false;

		const hasId = "id" in el.attributes;
		const hasAriaLabel =
			"aria-label" in el.attributes || "aria-labelledby" in el.attributes;

		return !hasId && !hasAriaLabel;
	});
}

/**
 * Find images without alt text
 */
export function findImagesWithoutAlt(parseResult) {
	return findElements(parseResult, (el) => {
		return el.type.toLowerCase() === "img" && !("alt" in el.attributes);
	});
}

/**
 * Find buttons without accessible labels
 */
export function findButtonsWithoutLabels(parseResult) {
	return findElements(parseResult, (el) => {
		if (el.type.toLowerCase() !== "button") return false;

		const hasAriaLabel =
			"aria-label" in el.attributes || "aria-labelledby" in el.attributes;
		const hasChildren = el.hasChildren;

		// Button needs either aria-label or text content
		return !hasAriaLabel && !hasChildren;
	});
}

/**
 * Analyze heading hierarchy
 */
export function analyzeHeadingHierarchy(parseResult) {
	if (!parseResult || !parseResult.headings) return { valid: true, issues: [] };

	const headings = parseResult.headings.sort((a, b) => a.line - b.line);
	const issues = [];

	// Check for multiple h1 elements
	const h1Count = headings.filter((h) => h.type.toLowerCase() === "h1").length;
	if (h1Count === 0) {
		issues.push({
			type: "missing-h1",
			message: "Page should have exactly one h1 element",
			severity: "high",
		});
	} else if (h1Count > 1) {
		issues.push({
			type: "multiple-h1",
			message: `Page has ${h1Count} h1 elements (should have exactly 1)`,
			severity: "high",
			lines: headings
				.filter((h) => h.type.toLowerCase() === "h1")
				.map((h) => h.line),
		});
	}

	// Check for skipped heading levels
	let previousLevel = 0;
	headings.forEach((heading) => {
		const level = parseInt(heading.type.toLowerCase().replace("h", ""));

		if (previousLevel > 0 && level > previousLevel + 1) {
			issues.push({
				type: "skipped-level",
				message: `Heading level skipped: ${heading.type} after h${previousLevel}`,
				severity: "medium",
				line: heading.line,
			});
		}

		previousLevel = level;
	});

	return {
		valid: issues.length === 0,
		issues,
		headingCount: headings.length,
		h1Count,
	};
}

/**
 * Check for landmark regions
 */
export function checkLandmarkRegions(parseResult) {
	if (!parseResult || !parseResult.landmarks)
		return { valid: true, missing: [] };

	const required = ["header", "nav", "main", "footer"];
	const missing = required.filter(
		(landmark) => !parseResult.landmarks.includes(landmark)
	);

	return {
		valid: missing.length === 0,
		missing,
		present: parseResult.landmarks,
	};
}
