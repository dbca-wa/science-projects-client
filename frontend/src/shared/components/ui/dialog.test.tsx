import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "./dialog";

describe("Dialog backdrop click behavior", () => {
	it("should close when clicking on overlay", () => {
		const onOpenChange = vi.fn();

		render(
			<Dialog open={true} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Test Dialog</DialogTitle>
						<DialogDescription>Dialog content</DialogDescription>
					</DialogHeader>
					<div>Some content</div>
				</DialogContent>
			</Dialog>
		);

		// Find the overlay (it's the first fixed element with bg-black/50)
		const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
		expect(overlay).toBeTruthy();
		
		// Click on the overlay
		fireEvent.click(overlay!);

		// Dialog should close
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("should not close when clicking inside dialog content", () => {
		const onOpenChange = vi.fn();

		render(
			<Dialog open={true} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Test Dialog</DialogTitle>
						<DialogDescription>Dialog content</DialogDescription>
					</DialogHeader>
					<div data-testid="content">Some content</div>
				</DialogContent>
			</Dialog>
		);

		// Click inside the dialog content
		const content = screen.getByTestId("content");
		fireEvent.click(content);

		// Dialog should NOT close
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it("should not close when clicking on the content wrapper", () => {
		const onOpenChange = vi.fn();

		render(
			<Dialog open={true} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Test Dialog</DialogTitle>
						<DialogDescription>Dialog content</DialogDescription>
					</DialogHeader>
					<div>Some content</div>
				</DialogContent>
			</Dialog>
		);

		// Find the content wrapper (pointer-events-none wrapper)
		const wrapper = document.querySelector('.fixed.inset-0.z-50.flex');
		expect(wrapper).toBeTruthy();
		
		// Click on the wrapper (should pass through due to pointer-events-none)
		fireEvent.click(wrapper!);

		// Dialog should NOT close (click passes through to overlay, but we're clicking on wrapper not overlay)
		expect(onOpenChange).not.toHaveBeenCalled();
	});
});
