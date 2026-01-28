import { makeAutoObservable } from "mobx";

export type LayerType =
  | "dbca_regions"
  | "dbca_districts"
  | "nrm_regions"
  | "ibra_regions"
  | "imcra_regions";

/**
 * MapStore manages all UI state for the project map interface.
 * 
 * This store handles:
 * - Search filtering
 * - Business area filtering
 * - Region layer visibility
 * - Display options (labels, colors)
 * 
 * Uses flat state structure with Sets for efficient lookups.
 */
export class MapStore {
  // Search state
  searchTerm: string = "";

  // Business area filter state
  selectedBusinessAreas: Set<number> = new Set();

  // Layer visibility state
  visibleLayers: Set<LayerType> = new Set();

  // Display options
  showLabels: boolean = true;
  showColors: boolean = true;

  constructor() {
    makeAutoObservable(this);
  }

  // Search actions
  setSearchTerm = (term: string): void => {
    this.searchTerm = term;
  };

  // Business area actions
  toggleBusinessArea = (id: number): void => {
    if (this.selectedBusinessAreas.has(id)) {
      this.selectedBusinessAreas.delete(id);
    } else {
      this.selectedBusinessAreas.add(id);
    }
  };

  selectAllBusinessAreas = (ids: number[]): void => {
    this.selectedBusinessAreas.clear();
    ids.forEach((id) => this.selectedBusinessAreas.add(id));
  };

  clearBusinessAreas = (): void => {
    this.selectedBusinessAreas.clear();
  };

  // Layer visibility actions
  toggleLayer = (layer: LayerType): void => {
    if (this.visibleLayers.has(layer)) {
      this.visibleLayers.delete(layer);
    } else {
      this.visibleLayers.add(layer);
    }
  };

  // Display option actions
  toggleLabels = (): void => {
    this.showLabels = !this.showLabels;
  };

  toggleColors = (): void => {
    this.showColors = !this.showColors;
  };

  // Computed properties
  get hasBusinessAreaFilter(): boolean {
    return this.selectedBusinessAreas.size > 0;
  }

  get visibleLayersList(): LayerType[] {
    return Array.from(this.visibleLayers);
  }
}
