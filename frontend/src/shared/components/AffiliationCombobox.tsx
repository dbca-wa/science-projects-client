import { useState, useEffect, useRef } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";
import { apiClient } from "@/shared/services/api/client.service";
import { toTitleCase } from "@/shared/lib/utils";
import type { IAffiliation } from "@/shared/types/org.types";

interface AffiliationComboboxProps {
  value?: number;
  onChange: (affiliationId?: number) => void;
  label?: string;
  placeholder: string;
  helperText?: string;
  isRequired?: boolean;
  isEditable?: boolean;
  disabled?: boolean;
}

/**
 * AffiliationCombobox component
 * Searchable dropdown for selecting affiliations
 * Based on original AffiliationSearchDropdown.tsx
 */
export const AffiliationCombobox = ({
  value,
  onChange,
  placeholder,
  helperText,
  isEditable = true,
  disabled = false,
}: AffiliationComboboxProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<IAffiliation[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedAffiliation, setSelectedAffiliation] = useState<IAffiliation | null>(null);
  const [isLoadingAffiliation, setIsLoadingAffiliation] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load selected affiliation by ID
  useEffect(() => {
    if (value && value > 0) {
      setIsLoadingAffiliation(true);
      apiClient
        .get<IAffiliation>(`agencies/affiliations/${value}`)
        .then((affiliation) => {
          setSelectedAffiliation(affiliation);
          setIsMenuOpen(false);
        })
        .catch((error) => {
          console.error("Error loading affiliation:", error);
        })
        .finally(() => {
          setIsLoadingAffiliation(false);
        });
    } else {
      setSelectedAffiliation(null);
    }
  }, [value]);

  // Search affiliations based on search term
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      apiClient
        .get<{ affiliations: IAffiliation[]; total_results: number; total_pages: number }>(
          "agencies/affiliations",
          {
            params: { searchTerm: searchTerm, page: 1 },
          }
        )
        .then((data) => {
          setFilteredItems(data.affiliations || []);
        })
        .catch((error) => {
          console.error("Error fetching affiliations:", error);
          setFilteredItems([]);
        });
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm]);

  const handleSelectAffiliation = (affiliation: IAffiliation) => {
    setSelectedAffiliation(affiliation);
    onChange(affiliation.id);
    setIsMenuOpen(false);
    setSearchTerm("");
  };

  const handleClearAffiliation = () => {
    if (!isEditable) return;
    setSelectedAffiliation(null);
    onChange(undefined);
    setIsMenuOpen(true);
    setSearchTerm("");
  };

  const handleCreateAffiliation = async () => {
    if (!searchTerm.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const titleCasedName = toTitleCase(searchTerm.trim());
      const newAffiliation = await apiClient.post<IAffiliation>("agencies/affiliations", {
        name: titleCasedName,
      });
      
      setSelectedAffiliation(newAffiliation);
      onChange(newAffiliation.id);
      setIsMenuOpen(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Error creating affiliation:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const showCreateOption = searchTerm.trim() !== "" && 
    filteredItems.length === 0 && 
    !isCreating;

  if (isLoadingAffiliation) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-2">
      {selectedAffiliation ? (
        <div className="relative flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2">
          <span className="text-green-500 dark:text-green-400 flex-1">
            {selectedAffiliation.name}
          </span>
          {isEditable && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAffiliation}
              disabled={disabled}
              className="h-6 w-6 p-0"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            onFocus={() => setIsMenuOpen(true)}
            disabled={disabled}
          />

          {/* Dropdown menu */}
          {isMenuOpen && (searchTerm.trim() !== "" || filteredItems.length > 0) && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredItems.map((affiliation) => (
                <button
                  key={affiliation.id}
                  type="button"
                  onClick={() => handleSelectAffiliation(affiliation)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-green-500 dark:text-green-300">
                    {affiliation.name}
                  </span>
                </button>
              ))}
              
              {/* Create new affiliation option */}
              {showCreateOption && (
                <button
                  type="button"
                  onClick={handleCreateAffiliation}
                  disabled={isCreating}
                  className="w-full text-left px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border-t border-gray-200 dark:border-gray-600"
                >
                  <span className="text-green-500 dark:text-green-300 flex items-center gap-2">
                    {isCreating ? (
                      <>Creating...</>
                    ) : (
                      <>
                        Click to add "{toTitleCase(searchTerm)}" as an organisation/affiliation
                      </>
                    )}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};
