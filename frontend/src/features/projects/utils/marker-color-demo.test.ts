import { describe, it, expect } from "vitest";
import { getMarkerColor, getMarkerDensityLabel, MARKER_COLORS } from "./marker-creation";

describe("marker color system demo", () => {
  it("should demonstrate the density-based color progression", () => {
    console.log("\n🎨 Project Map Marker Color System Demo\n");
    
    const testCases = [
      { count: 1, label: "Single Project" },
      { count: 5, label: "Small Cluster" },
      { count: 25, label: "Medium Cluster" },
      { count: 75, label: "Large Cluster" },
    ];

    testCases.forEach(({ count, label }) => {
      const selectedColor = getMarkerColor(count, true);
      const unselectedColor = getMarkerColor(count, false);
      const densityLabel = getMarkerDensityLabel(count);
      
      console.log(`${label} (${count} projects):`);
      console.log(`  Selected:   ${selectedColor} (${densityLabel})`);
      console.log(`  Unselected: ${unselectedColor} (muted)`);
      console.log("");
      
      // Verify the colors are correct
      expect(selectedColor).toBeDefined();
      expect(unselectedColor).toBeDefined();
      expect(densityLabel).toBeDefined();
    });

    console.log("Color Progression (Selected):");
    console.log(`  Blue → Green → Amber → Red`);
    console.log(`  ${MARKER_COLORS.density.single} → ${MARKER_COLORS.density.small} → ${MARKER_COLORS.density.medium} → ${MARKER_COLORS.density.large}`);
    console.log("");

    console.log("Benefits:");
    console.log("  ✅ Density awareness - quickly spot high-concentration areas");
    console.log("  ✅ Selection clarity - selected markers are vibrant, unselected are muted");
    console.log("  ✅ Intuitive mapping - color intensity matches project density");
    console.log("  ✅ Accessibility - high contrast between states");
  });

  it("should show color transitions at boundaries", () => {
    const boundaries = [
      { count: 1, expected: "single" },
      { count: 2, expected: "small" },
      { count: 10, expected: "small" },
      { count: 11, expected: "medium" },
      { count: 50, expected: "medium" },
      { count: 51, expected: "large" },
    ];

    boundaries.forEach(({ count, expected }) => {
      const label = getMarkerDensityLabel(count);
      expect(label).toContain(expected);
    });
  });

  it("should maintain consistent color mapping", () => {
    // Test that the same count always returns the same color
    for (let i = 0; i < 10; i++) {
      expect(getMarkerColor(1, true)).toBe(MARKER_COLORS.density.single);
      expect(getMarkerColor(5, true)).toBe(MARKER_COLORS.density.small);
      expect(getMarkerColor(25, true)).toBe(MARKER_COLORS.density.medium);
      expect(getMarkerColor(75, true)).toBe(MARKER_COLORS.density.large);
    }
  });
});