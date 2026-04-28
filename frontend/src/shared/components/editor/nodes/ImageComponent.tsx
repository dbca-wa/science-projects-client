/**
 * ImageComponent — rendered by ImageNode's decorate() method.
 *
 * Features:
 * - Click to select (blue outline)
 * - Corner resize handles (drag to resize, aspect ratio locked)
 * - Floating toolbar with alignment + delete
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import {
	AlignLeft,
	AlignCenter,
	AlignRight,
	Maximize2,
	Trash2,
} from "lucide-react";
import { $updateImageNode } from "./ImageNode";
import type { ImageAlignment } from "./ImageNode";

interface ImageComponentProps {
	src: string;
	altText: string;
	width: string;
	alignment: ImageAlignment;
	nodeKey: string;
}

export const ImageComponent = ({
	src,
	altText,
	width,
	alignment,
	nodeKey,
}: ImageComponentProps) => {
	const [editor] = useLexicalComposerContext();
	const [isSelected, setIsSelected] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [currentWidth, setCurrentWidth] = useState(width);
	const imgRef = useRef<HTMLImageElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const startX = useRef(0);
	const startWidth = useRef(0);

	// Click outside to deselect
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsSelected(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			if (editor.isEditable()) {
				setIsSelected(true);
			}
		},
		[editor]
	);

	// Resize handlers
	const handleResizeStart = useCallback(
		(e: React.PointerEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsResizing(true);
			startX.current = e.clientX;
			startWidth.current = imgRef.current?.offsetWidth ?? 0;

			const handleResizeMove = (moveEvent: PointerEvent) => {
				const delta = moveEvent.clientX - startX.current;
				const newWidth = Math.max(100, startWidth.current + delta);
				const containerWidth =
					containerRef.current?.parentElement?.offsetWidth ?? 800;
				const widthPercent = Math.min(
					100,
					Math.round((newWidth / containerWidth) * 100)
				);
				setCurrentWidth(`${widthPercent}%`);
			};

			const handleResizeEnd = () => {
				setIsResizing(false);
				document.removeEventListener("pointermove", handleResizeMove);
				document.removeEventListener("pointerup", handleResizeEnd);

				// Commit the width to the Lexical node
				editor.update(() => {
					$updateImageNode(nodeKey, { width: currentWidth });
				});
			};

			document.addEventListener("pointermove", handleResizeMove);
			document.addEventListener("pointerup", handleResizeEnd);
		},
		[editor, nodeKey, currentWidth]
	);

	const handleAlignment = useCallback(
		(newAlignment: ImageAlignment) => {
			editor.update(() => {
				$updateImageNode(nodeKey, { alignment: newAlignment });
			});
		},
		[editor, nodeKey]
	);

	const handleDelete = useCallback(() => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if (node) node.remove();
		});
	}, [editor, nodeKey]);

	// Alignment styles for the wrapper
	const wrapperStyle: React.CSSProperties = {
		position: "relative",
		display:
			alignment === "center" || alignment === "full" ? "block" : "inline-block",
		width: alignment === "full" ? "100%" : currentWidth,
		maxWidth: "100%",
		margin:
			alignment === "center"
				? "8px auto"
				: alignment === "left"
					? "8px 16px 8px 0"
					: alignment === "right"
						? "8px 0 8px 16px"
						: "8px 0",
		float:
			alignment === "left"
				? "left"
				: alignment === "right"
					? "right"
					: undefined,
		clear: alignment === "center" || alignment === "full" ? "both" : undefined,
	};

	const isEditable = editor.isEditable();

	return (
		<div
			ref={containerRef}
			style={wrapperStyle}
			onClick={handleSelect}
			className={`editor-image-wrapper ${isSelected && isEditable ? "ring-2 ring-blue-500 rounded-lg" : ""}`}
		>
			<img
				ref={imgRef}
				src={src}
				alt={altText}
				style={{
					width: "100%",
					borderRadius: "8px",
					display: "block",
					userSelect: "none",
					pointerEvents: isResizing ? "none" : "auto",
				}}
				draggable={false}
			/>

			{/* Resize handles — only when selected and editable */}
			{isSelected && isEditable && (
				<>
					{/* Bottom-right resize handle */}
					<div
						onPointerDown={handleResizeStart}
						style={{
							position: "absolute",
							bottom: 0,
							right: 0,
							width: 14,
							height: 14,
							background: "#2563eb",
							borderRadius: "2px 0 8px 0",
							cursor: "nwse-resize",
							zIndex: 10,
						}}
					/>
					{/* Bottom-left resize handle */}
					<div
						onPointerDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setIsResizing(true);
							startX.current = e.clientX;
							startWidth.current = imgRef.current?.offsetWidth ?? 0;

							const handleMove = (moveEvent: PointerEvent) => {
								const delta = startX.current - moveEvent.clientX;
								const newWidth = Math.max(100, startWidth.current + delta);
								const containerWidth =
									containerRef.current?.parentElement?.offsetWidth ?? 800;
								const widthPercent = Math.min(
									100,
									Math.round((newWidth / containerWidth) * 100)
								);
								setCurrentWidth(`${widthPercent}%`);
							};

							const handleEnd = () => {
								setIsResizing(false);
								document.removeEventListener("pointermove", handleMove);
								document.removeEventListener("pointerup", handleEnd);
								editor.update(() => {
									$updateImageNode(nodeKey, { width: currentWidth });
								});
							};

							document.addEventListener("pointermove", handleMove);
							document.addEventListener("pointerup", handleEnd);
						}}
						style={{
							position: "absolute",
							bottom: 0,
							left: 0,
							width: 14,
							height: 14,
							background: "#2563eb",
							borderRadius: "0 0 0 8px",
							cursor: "nesw-resize",
							zIndex: 10,
						}}
					/>
				</>
			)}

			{/* Floating toolbar — above the image when selected */}
			{isSelected && isEditable && (
				<div
					style={{
						position: "absolute",
						top: -40,
						left: "50%",
						transform: "translateX(-50%)",
						zIndex: 20,
					}}
					className="flex items-center gap-0.5 rounded-lg border bg-white px-1 py-0.5 shadow-lg dark:bg-gray-900 dark:border-gray-700"
					onMouseDown={(e) => e.stopPropagation()}
				>
					<ToolbarBtn
						icon={<AlignLeft className="h-3.5 w-3.5" />}
						active={alignment === "left"}
						onClick={() => handleAlignment("left")}
						label="Align left"
					/>
					<ToolbarBtn
						icon={<AlignCenter className="h-3.5 w-3.5" />}
						active={alignment === "center"}
						onClick={() => handleAlignment("center")}
						label="Align centre"
					/>
					<ToolbarBtn
						icon={<AlignRight className="h-3.5 w-3.5" />}
						active={alignment === "right"}
						onClick={() => handleAlignment("right")}
						label="Align right"
					/>
					<ToolbarBtn
						icon={<Maximize2 className="h-3.5 w-3.5" />}
						active={alignment === "full"}
						onClick={() => handleAlignment("full")}
						label="Full width"
					/>
					<div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />
					<ToolbarBtn
						icon={<Trash2 className="h-3.5 w-3.5" />}
						active={false}
						onClick={handleDelete}
						label="Delete image"
						destructive
					/>
				</div>
			)}
		</div>
	);
};

/** Small toolbar button used in the floating image toolbar */
const ToolbarBtn = ({
	icon,
	active,
	onClick,
	label,
	destructive = false,
}: {
	icon: React.ReactNode;
	active: boolean;
	onClick: () => void;
	label: string;
	destructive?: boolean;
}) => (
	<button
		type="button"
		onClick={(e) => {
			e.stopPropagation();
			onClick();
		}}
		className={`p-1.5 rounded transition-colors ${
			destructive
				? "text-destructive hover:bg-destructive/10"
				: active
					? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
					: "text-muted-foreground hover:bg-muted"
		}`}
		title={label}
		aria-label={label}
	>
		{icon}
	</button>
);
