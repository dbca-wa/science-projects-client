import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
	getGuideSections,
	getGuideSection,
	createGuideSection,
	updateGuideSection,
	deleteGuideSection,
	createContentField,
	updateContentField,
	deleteContentField,
} from "./guide.service";
import { apiClient } from "@/shared/services/api/client.service";

vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("guide.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("getGuideSections should GET all sections", async () => {
		(apiClient.get as Mock).mockResolvedValue([]);
		await getGuideSections();
		expect(apiClient.get).toHaveBeenCalledWith(
			expect.stringContaining("guide-sections")
		);
	});

	it("getGuideSection should GET section by ID", async () => {
		(apiClient.get as Mock).mockResolvedValue({ id: "abc" });
		const result = await getGuideSection("abc");
		expect(result).toEqual({ id: "abc" });
	});

	it("createGuideSection should POST section data", async () => {
		(apiClient.post as Mock).mockResolvedValue({ id: "new" });
		await createGuideSection({ id: "new", title: "New Section", order: 0 });
		expect(apiClient.post).toHaveBeenCalledWith(
			expect.stringContaining("guide-sections"),
			{ id: "new", title: "New Section", order: 0 }
		);
	});

	it("updateGuideSection should PATCH section data", async () => {
		(apiClient.patch as Mock).mockResolvedValue({ id: "abc" });
		await updateGuideSection("abc", { title: "Updated" });
		expect(apiClient.patch).toHaveBeenCalledWith(
			expect.stringContaining("abc"),
			{ title: "Updated" }
		);
	});

	it("deleteGuideSection should DELETE section by ID", async () => {
		(apiClient.delete as Mock).mockResolvedValue(undefined);
		await deleteGuideSection("abc");
		expect(apiClient.delete).toHaveBeenCalledWith(
			expect.stringContaining("abc")
		);
	});

	it("createContentField should POST field data", async () => {
		(apiClient.post as Mock).mockResolvedValue({ id: "field1" });
		await createContentField({
			title: "New Field",
			section: "abc",
			field_key: "new_field",
		});
		expect(apiClient.post).toHaveBeenCalledWith(
			expect.stringContaining("content-fields"),
			expect.objectContaining({ title: "New Field" })
		);
	});

	it("updateContentField should PATCH field data", async () => {
		(apiClient.patch as Mock).mockResolvedValue({ id: "field1" });
		await updateContentField("field1", { title: "Updated" });
		expect(apiClient.patch).toHaveBeenCalledWith(
			expect.stringContaining("field1"),
			{ title: "Updated" }
		);
	});

	it("deleteContentField should DELETE field by ID", async () => {
		(apiClient.delete as Mock).mockResolvedValue(undefined);
		await deleteContentField("field1");
		expect(apiClient.delete).toHaveBeenCalledWith(
			expect.stringContaining("field1")
		);
	});
});
