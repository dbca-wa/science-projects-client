import { Filter } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { MapSearchBar } from "./MapSearchBar";
import { MapBusinessAreaFilters } from "./MapBusinessAreaFilters";
import { MapLocationFilters } from "./MapLocationFilters";
import { MapDisplayOptions } from "./MapDisplayOptions";
import { ProjectCount } from "./ProjectCount";

interface MapSidebarProps {
  projectCount: number;
}

/**
 * MapSidebar component
 * 
 * Container for all filter and control components.
 * Desktop: Fixed sidebar on the left
 * Mobile: Sheet component with floating button
 */
export const MapSidebar = ({ projectCount }: MapSidebarProps) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-96 h-full overflow-y-auto border-r bg-background">
        <div className="p-4 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Map Filters</h2>
            <MapSearchBar />
          </div>
          <MapBusinessAreaFilters />
          <MapLocationFilters />
          <MapDisplayOptions />
          <ProjectCount count={projectCount} />
        </div>
      </aside>

      {/* Mobile Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed top-4 left-4 z-50 lg:hidden shadow-lg"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Map Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <MapSearchBar />
            <MapBusinessAreaFilters />
            <MapLocationFilters />
            <MapDisplayOptions />
            <ProjectCount count={projectCount} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
