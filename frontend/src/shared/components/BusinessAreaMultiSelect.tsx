import { useState, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { ChevronDown, X } from "lucide-react";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import type { IBusinessArea } from "@/shared/types/org.types";

interface BusinessAreaMultiSelectProps {
  selectedBusinessAreas: number[];
  onToggleBusinessArea: (baId: number) => void;
  onSelectAll: (businessAreaIds: number[]) => void;
  onClearAll: () => void;
  className?: string;
  placeholder?: string;
  showTags?: boolean;
  disabled?: boolean;
}

/**
 * BusinessAreaMultiSelect - Reusable multi-select component for business areas
 * 
 * Features:
 * - Multi-select with checkboxes using shadcn Popover
 * - "Select All" and "Clear All" functionality
 * - Display selected count in trigger button
 * - Show inactive business areas with "(Inactive)" label
 * - Keyboard navigation and accessibility
 * - Optional tags display for selected items
 */
export const BusinessAreaMultiSelect = ({
  selectedBusinessAreas,
  onToggleBusinessArea,
  onSelectAll,
  onClearAll,
  className = "",
  placeholder = "Business Areas",
  showTags = false,
  disabled = false,
}: BusinessAreaMultiSelectProps) => {
  const { data: businessAreas, isLoading: isLoadingBusinessAreas } = useBusinessAreas();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Sort business areas alphabetically
  const sortedBusinessAreas = useMemo(() => {
    if (!businessAreas) return [];
    return [...businessAreas].sort((a, b) => a.name.localeCompare(b.name));
  }, [businessAreas]);

  // Get selected business area names for display
  const selectedNames = useMemo(() => {
    if (selectedBusinessAreas.length === 0) return placeholder;
    if (businessAreas && selectedBusinessAreas.length === businessAreas.length) return "All Selected";
    if (selectedBusinessAreas.length === 1) {
      const selected = businessAreas?.find(ba => ba.id === selectedBusinessAreas[0]);
      return selected?.name || placeholder;
    }
    return `${selectedBusinessAreas.length} Selected`;
  }, [selectedBusinessAreas, businessAreas, placeholder]);

  // Get selected business areas for tag display
  const selectedBusinessAreasList = useMemo(() => {
    if (!businessAreas) return [];
    return businessAreas.filter(ba => ba.id && selectedBusinessAreas.includes(ba.id));
  }, [businessAreas, selectedBusinessAreas]);

  // Show tags only when some (but not all) are selected and showTags is true
  const shouldShowTags = useMemo(() => {
    return showTags && 
           selectedBusinessAreas.length > 0 && 
           businessAreas && 
           selectedBusinessAreas.length < businessAreas.length;
  }, [showTags, selectedBusinessAreas, businessAreas]);

  const handleSelectAll = () => {
    if (businessAreas) {
      const allIds = businessAreas.map(ba => ba.id).filter((id): id is number => id !== undefined);
      onSelectAll(allIds);
    }
  };

  const formatBusinessAreaName = (businessArea: IBusinessArea) => {
    if (businessArea.is_active === false) {
      return `${businessArea.name} (Inactive)`;
    }
    return businessArea.name;
  };

  return (
    <div className={className}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-sm font-normal h-11"
            disabled={disabled || isLoadingBusinessAreas}
          >
            <span className="truncate">{selectedNames}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Business Areas</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-7 text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="h-7 text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-3">
            <div className="space-y-2">
              {isLoadingBusinessAreas && (
                <div className="text-sm text-muted-foreground">Loading...</div>
              )}
              {sortedBusinessAreas.map((ba) => {
                if (ba.id === undefined) return null;
                return (
                  <div key={ba.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ba-${ba.id}`}
                      checked={selectedBusinessAreas.includes(ba.id)}
                      onCheckedChange={() => onToggleBusinessArea(ba.id!)}
                    />
                    <Label
                      htmlFor={`ba-${ba.id}`}
                      className={`text-sm font-normal cursor-pointer flex-1 ${
                        ba.is_active === false ? 'text-muted-foreground' : ''
                      }`}
                    >
                      {formatBusinessAreaName(ba)}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Business Area Tags */}
      {shouldShowTags && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedBusinessAreasList.map((ba) => (
            <div
              key={ba.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-md text-sm"
            >
              <span>{ba.name}</span>
              <button
                onClick={() => ba.id && onToggleBusinessArea(ba.id)}
                className="cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-sm p-0.5 transition-colors"
                aria-label={`Remove ${ba.name}`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};