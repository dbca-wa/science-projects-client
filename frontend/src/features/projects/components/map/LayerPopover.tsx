import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Switch } from "@/shared/components/ui/switch";
import { Layers, Eye, EyeOff, Palette } from "lucide-react";
import { useProjectMapStore } from "@/app/stores/store-context";
import { mapAnnouncements } from "@/shared/utils/screen-reader.utils";
/**
 * Layer type used by the store (kebab-case format)
 */
type StoreLayerType = "dbcaregion" | "dbcadistrict" | "nrm" | "ibra" | "imcra";

/**
 * Layer display names for UI
 */
const LAYER_NAMES: Record<StoreLayerType, string> = {
	dbcaregion: "DBCA Regions",
	dbcadistrict: "DBCA Districts", 
	nrm: "NRM Regions",
	ibra: "IBRA Bioregions",
	imcra: "IMCRA Marine Regions",
};

/**
 * Layer descriptions for tooltips
 */
const LAYER_DESCRIPTIONS: Record<StoreLayerType, string> = {
	dbcaregion: "Department of Biodiversity, Conservation and Attractions administrative regions",
	dbcadistrict: "DBCA district boundaries for local management areas",
	nrm: "Natural Resource Management regions for environmental planning",
	ibra: "Interim Biogeographic Regionalisation for Australia terrestrial regions",
	imcra: "Integrated Marine and Coastal Regionalisation of Australia marine regions",
};

/**
 * Layer colors mapping
 */
const LAYER_COLORS: Record<StoreLayerType, string> = {
	dbcaregion: "#3b82f6", // blue
	dbcadistrict: "#10b981", // green
	nrm: "#f59e0b", // amber
	ibra: "#8b5cf6", // purple
	imcra: "#ef4444", // red
};

/**
 * LayerPopover component
 * 
 * Provides controls for managing GeoJSON layer visibility and display options.
 * 
 * Features:
 * - Layer visibility toggles with checkboxes
 * - "Show Labels" toggle switch
 * - "Show Colors" toggle switch  
 * - Color indicators for each layer
 * - Keyboard navigation and accessibility
 * - Escape key handling to close popover
 * - Proper focus management
 */
export const LayerPopover = observer(() => {
	const store = useProjectMapStore();
	const popoverRef = useRef<HTMLDivElement>(null);

	// Handle escape key to close popover
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				// Find the popover trigger and close it
				const popoverTrigger = popoverRef.current?.querySelector('[data-state="open"]');
				if (popoverTrigger instanceof HTMLElement) {
					popoverTrigger.click();
				}
			}
		};

		// Only add listener when popover is open
		const popoverContent = popoverRef.current?.querySelector('[role="dialog"]');
		if (popoverContent) {
			document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
		}
	}, []);

	// Handle keyboard navigation within popover
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Tab") {
			// Let default tab behavior handle focus management
			return;
		}
		
		if (event.key === "Escape") {
			event.preventDefault();
			// Close popover by clicking trigger
			const trigger = popoverRef.current?.querySelector('[data-state="open"]');
			if (trigger instanceof HTMLElement) {
				trigger.click();
				trigger.focus(); // Return focus to trigger
			}
		}
	};

	// Handle layer toggle
	const handleLayerToggle = (layerType: StoreLayerType, checked: boolean, e?: React.MouseEvent) => {
		if (e) e.stopPropagation();
		
		if (checked) {
			store.showLayer(layerType);
		} else {
			store.hideLayer(layerType);
		}
		
		// Announce to screen readers
		const layerName = LAYER_NAMES[layerType];
		mapAnnouncements.layerToggle(layerName, checked);
	};

	// Handle show all layers
	const handleShowAllLayers = (e: React.MouseEvent) => {
		e.stopPropagation();
		store.showAllLayers();
		mapAnnouncements.allLayersToggle('show');
	};

	// Handle hide all layers
	const handleHideAllLayers = (e: React.MouseEvent) => {
		e.stopPropagation();
		store.hideAllLayers();
		mapAnnouncements.allLayersToggle('hide');
	};

	// Check if all layers are visible
	const allLayersVisible = store.state.visibleLayerTypes.length === 5;
	const noLayersVisible = store.state.visibleLayerTypes.length === 0;

	return (
		<div ref={popoverRef}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="flex items-center gap-2 h-8 px-3 w-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
						aria-label="Layer controls - toggle map layer visibility and display options"
					>
						<Layers className="h-4 w-4" />
						<span className="text-xs font-medium">Layers</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent 
					className="w-72 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
					align="end"
					alignOffset={0}
					sideOffset={8}
					avoidCollisions={true}
					collisionPadding={8}
					onKeyDown={handleKeyDown}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="space-y-4">
						{/* Header */}
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
								Map Layers
							</h3>
							<div className="flex gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleShowAllLayers}
									disabled={allLayersVisible}
									className="text-xs px-2 py-1 h-auto"
								>
									Show All
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleHideAllLayers}
									disabled={noLayersVisible}
									className="text-xs px-2 py-1 h-auto"
								>
									Hide All
								</Button>
							</div>
						</div>

						{/* Layer checkboxes */}
						<div className="space-y-3">
							{(Object.keys(LAYER_NAMES) as StoreLayerType[]).map((layerType) => {
								const isVisible = store.state.visibleLayerTypes.includes(layerType);
								const layerColor = LAYER_COLORS[layerType];

								return (
									<div 
										key={layerType} 
										className="flex items-center space-x-3"
										onClick={(e) => e.stopPropagation()}
									>
										<Checkbox
											id={`layer-${layerType}`}
											checked={isVisible}
											onCheckedChange={(checked) => 
												handleLayerToggle(layerType, checked as boolean)
											}
											aria-describedby={`layer-${layerType}-desc`}
										/>
										<div 
											className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0"
											style={{ backgroundColor: layerColor }}
											aria-hidden="true"
										/>
										<div className="flex-1 min-w-0">
											<label 
												htmlFor={`layer-${layerType}`}
												className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
											>
												{LAYER_NAMES[layerType]}
											</label>
											<p 
												id={`layer-${layerType}-desc`}
												className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
											>
												{LAYER_DESCRIPTIONS[layerType]}
											</p>
										</div>
									</div>
								);
							})}
						</div>

						{/* Display options */}
						<div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
							<h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
								Display Options
							</h4>
							
							{/* Show Labels toggle */}
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									{store.state.showLabels ? (
										<Eye className="h-4 w-4 text-gray-500" />
									) : (
										<EyeOff className="h-4 w-4 text-gray-500" />
									)}
									<label 
										htmlFor="show-labels"
										className="text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
									>
										Show Labels
									</label>
								</div>
								<Switch
									id="show-labels"
									checked={store.state.showLabels}
									onCheckedChange={(checked) => {
										store.toggleLabels();
										mapAnnouncements.displayOptionToggle('labels', checked);
									}}
									aria-describedby="show-labels-desc"
								/>
							</div>
							<p 
								id="show-labels-desc"
								className="text-xs text-gray-500 dark:text-gray-400 ml-6"
							>
								Display region names on the map
							</p>

							{/* Show Colors toggle */}
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Palette className="h-4 w-4 text-gray-500" />
									<label 
										htmlFor="show-colors"
										className="text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
									>
										Show Colors
									</label>
								</div>
								<Switch
									id="show-colors"
									checked={store.state.showColors}
									onCheckedChange={(checked) => {
										store.toggleColors();
										mapAnnouncements.displayOptionToggle('colors', checked);
									}}
									aria-describedby="show-colors-desc"
								/>
							</div>
							<p 
								id="show-colors-desc"
								className="text-xs text-gray-500 dark:text-gray-400 ml-6"
							>
								Fill regions with colors or show outline only
							</p>
						</div>

						{/* Layer count info */}
						<div className="border-t border-gray-200 dark:border-gray-700 pt-3">
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{store.state.visibleLayerTypes.length} of 5 layers visible
							</p>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
});

LayerPopover.displayName = "LayerPopover";