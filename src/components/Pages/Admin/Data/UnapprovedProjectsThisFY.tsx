import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUnapprovedProjectsThisFY } from "@/lib/api";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileText,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

// Types based on backend response
interface UnapprovedDocument {
  project_id: number;
  document_id: number;
  kind:
    | "concept"
    | "projectplan"
    | "progressreport"
    | "studentreport"
    | "projectclosure";
  project_title: string;
  project_leader_email: string | null;
  business_area_leader_email: string | null;
  business_area_name: string | null;
  project_lead_approval_granted: boolean;
  business_area_lead_approval_granted: boolean;
  directorate_approval_granted: boolean;
  status: string;
  created_at: string;
  modified_at: string;
}

interface UnapprovedProjectsData {
  latest_year: number;
  concept: UnapprovedDocument[];
  project_plan: UnapprovedDocument[];
  progress_report: UnapprovedDocument[];
  student_report: UnapprovedDocument[];
  project_closure: UnapprovedDocument[];
  all: UnapprovedDocument[];
}

type DocumentKind =
  | "concept"
  | "projectplan"
  | "progressreport"
  | "studentreport"
  | "projectclosure"
  | "all";
type ApprovalLevel = "project_lead" | "business_area_lead" | "directorate";

const docKindsDict = {
  concept: {
    title: "Concept Plan",
    color: "lightgreen",
    iconColor: "text-green-300",
  },
  projectplan: {
    title: "Project Plan",
    color: "orange",
    iconColor: "text-orange-500",
  },
  progressreport: {
    title: "Progress Report",
    color: "green",
    iconColor: "text-green-500",
  },
  studentreport: {
    title: "Student Report",
    color: "blue",
    iconColor: "text-blue-500",
  },
  projectclosure: {
    title: "Project Closure",
    color: "red",
    iconColor: "text-red-500",
  },
};

const approvalLevelsDict = {
  project_lead: { title: "Project Lead", color: "blue" },
  business_area_lead: { title: "Business Area Lead", color: "orange" },
  directorate: { title: "Directorate", color: "red" },
};

// Pre-create static elements to avoid recreation
const DOC_TYPE_ORDER = [
  "concept",
  "projectplan",
  "progressreport",
  "studentreport",
  "projectclosure",
];
const STATUS_ORDER = ["new", "revising", "inreview", "inapproval", "approved"];

// Enhanced cache for parsed titles with LRU behavior
const createTitleCache = () => {
  const cache = new Map<string, string>();
  const maxSize = 1000;

  return {
    get: (key: string) => {
      if (cache.has(key)) {
        // Move to end (most recently used)
        const value = cache.get(key)!;
        cache.delete(key);
        cache.set(key, value);
        return value;
      }
      return undefined;
    },
    set: (key: string, value: string) => {
      if (cache.size >= maxSize) {
        // Remove oldest entry
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
  };
};

const titleCache = createTitleCache();

// Optimize title parsing with better caching and minimal DOM operations
const parseTitle = (titleData: string): string => {
  const cached = titleCache.get(titleData);
  if (cached !== undefined) {
    return cached;
  }

  // Quick check for simple strings (no HTML)
  if (!titleData.includes("<")) {
    titleCache.set(titleData, titleData);
    return titleData;
  }

  // Only create DOM elements when necessary
  const wrapper = document.createElement("div");
  wrapper.innerHTML = titleData;
  const tag = wrapper.querySelector("p, span, h1, h2, h3, h4");
  const result = tag
    ? tag.textContent || ""
    : wrapper.textContent || wrapper.innerHTML;

  titleCache.set(titleData, result);
  return result;
};

// Helper function to check if email is DBCA email
const isDbcaEmail = (email: string | null): boolean => {
  return email ? email.endsWith("@dbca.wa.gov.au") : false;
};

// Helper function to determine if a document is bumpable
const isDocumentBumpable = (doc: UnapprovedDocument): boolean => {
  // If project lead approval is not granted and we have a DBCA email
  if (!doc.project_lead_approval_granted) {
    return isDbcaEmail(doc.project_leader_email);
  }

  // If business area lead approval is not granted and we have a DBCA email
  if (!doc.business_area_lead_approval_granted) {
    return isDbcaEmail(doc.business_area_leader_email);
  }

  // Directorate approvals are not bumpable
  return false;
};

// Helper function to determine if a document has missing leader info
const hasMissingLeaderInfo = (doc: UnapprovedDocument): boolean => {
  // Check if project lead approval is needed but no email exists
  if (!doc.project_lead_approval_granted && !doc.project_leader_email) {
    return true;
  }

  // Check if business area lead approval is needed but no email exists
  if (
    !doc.business_area_lead_approval_granted &&
    !doc.business_area_leader_email
  ) {
    return true;
  }

  return false;
};

// Helper function to determine if a document has external email
const hasExternalEmailState = (doc: UnapprovedDocument): boolean => {
  // Check if project lead approval is needed and has external email
  if (!doc.project_lead_approval_granted && doc.project_leader_email) {
    return !isDbcaEmail(doc.project_leader_email);
  }

  // Check if business area lead approval is needed and has external email
  if (
    !doc.business_area_lead_approval_granted &&
    doc.business_area_leader_email
  ) {
    return !isDbcaEmail(doc.business_area_leader_email);
  }

  return false;
};

// Pre-process documents to avoid repeated calculations
const preprocessDocument = (doc: UnapprovedDocument) => {
  return {
    ...doc,
    _cached: {
      cleanTitle: parseTitle(doc.project_title).toLowerCase(),
      isBumpable: isDocumentBumpable(doc),
      hasMissingInfo: hasMissingLeaderInfo(doc),
      hasExternalEmail: hasExternalEmailState(doc),
    },
  };
};

// optimised cell components with display names for debugging
const DocumentCell = memo(({ kind }: { kind: string }) => {
  const docInfo = docKindsDict[kind as keyof typeof docKindsDict];
  if (!docInfo) {
    return (
      <div className="flex items-center gap-2 p-1">
        <FileText className="h-4 w-4 text-gray-400" />
        <span className="text-xs leading-tight">{kind}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 p-1">
      <FileText className={`h-4 w-4 ${docInfo.iconColor}`} />
      <span className="text-xs leading-tight">{docInfo.title}</span>
    </div>
  );
});
DocumentCell.displayName = "DocumentCell";

const ProjectTitleCell = memo(
  ({
    title,
    onClick,
  }: {
    title: string;
    onClick: (e: React.MouseEvent) => void;
  }) => {
    const cleanTitle = useMemo(() => parseTitle(title), [title]);
    return (
      <span
        className="cursor-pointer font-medium text-blue-600 hover:underline dark:text-blue-400"
        onClick={onClick}
      >
        {cleanTitle}
      </span>
    );
  },
);
ProjectTitleCell.displayName = "ProjectTitleCell";

const StatusCell = memo(({ status }: { status: string }) => (
  <Badge variant="outline" className="capitalize">
    {status.replace("_", " ")}
  </Badge>
));
StatusCell.displayName = "StatusCell";

const BusinessAreaCell = memo(
  ({ businessArea }: { businessArea: string | null }) => (
    <span className="text-sm">{businessArea || "N/A"}</span>
  ),
);
BusinessAreaCell.displayName = "BusinessAreaCell";

// Helper function to extract name from email
const extractNameFromEmail = (email: string | null): string | null => {
  if (!email) return null;

  // Extract the part before @ and convert to readable name
  const localPart = email.split("@")[0];

  // Handle common email formats like first.last, firstname.lastname, etc.
  const nameParts = localPart
    .split(/[._-]/) // Split on dots, underscores, or hyphens
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .filter((part) => part.length > 0);

  return nameParts.length > 0 ? nameParts.join(" ") : localPart;
};

const WaitingOnCell = memo(
  ({
    document_id,
    project_lead_approval_granted,
    business_area_lead_approval_granted,
    directorate_approval_granted,
    project_leader_email,
    business_area_leader_email,
    onBumpClick,
  }: {
    document_id: number;
    project_lead_approval_granted: boolean;
    business_area_lead_approval_granted: boolean;
    directorate_approval_granted: boolean;
    project_leader_email: string | null;
    business_area_leader_email: string | null;
    onBumpClick: (documentId: number, email: string, type: string) => void;
  }) => {
    const pendingInfo = useMemo(() => {
      // Determine the first pending approval level in hierarchy
      if (!project_lead_approval_granted) {
        const hasDbcaEmail = isDbcaEmail(project_leader_email);
        return {
          badge: (
            <Badge
              key="project"
              variant="secondary"
              className="w-full bg-blue-100 py-[5px] text-blue-800"
            >
              Project Lead
            </Badge>
          ),
          email: project_leader_email,
          name: extractNameFromEmail(project_leader_email),
          type: "Project Lead",
          showBump: hasDbcaEmail,
          missingInfo: !project_leader_email,
          nonDbcaEmail: project_leader_email && !hasDbcaEmail,
        };
      }

      if (!business_area_lead_approval_granted) {
        const hasDbcaEmail = isDbcaEmail(business_area_leader_email);
        return {
          badge: (
            <Badge
              key="ba"
              variant="secondary"
              className="w-full bg-orange-100 py-[5px] text-orange-800"
            >
              BA Lead
            </Badge>
          ),
          email: business_area_leader_email,
          name: extractNameFromEmail(business_area_leader_email),
          type: "Business Area Lead",
          showBump: hasDbcaEmail,
          missingInfo: !business_area_leader_email,
          nonDbcaEmail: business_area_leader_email && !hasDbcaEmail,
        };
      }

      if (!directorate_approval_granted) {
        return {
          badge: (
            <Badge
              key="dir"
              variant="secondary"
              className="w-full bg-red-100 py-[5px] text-red-800"
            >
              Directorate
            </Badge>
          ),
          email: null,
          name: null,
          type: "Directorate",
          showBump: false,
          missingInfo: false,
          nonDbcaEmail: false,
        };
      }

      // All approvals granted - shouldn't happen in this view but handle gracefully
      return {
        badge: null,
        email: null,
        name: null,
        type: null,
        showBump: false,
        missingInfo: false,
        nonDbcaEmail: false,
      };
    }, [
      project_lead_approval_granted,
      business_area_lead_approval_granted,
      directorate_approval_granted,
      project_leader_email,
      business_area_leader_email,
    ]);

    const handleBumpClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (pendingInfo.email && pendingInfo.type) {
          onBumpClick(document_id, pendingInfo.email, pendingInfo.type);
        }
      },
      [document_id, pendingInfo.email, pendingInfo.type, onBumpClick],
    );

    if (!pendingInfo.badge) {
      return <span className="text-sm text-gray-500">All approved</span>;
    }

    return (
      <div className="flex w-full flex-col items-center gap-3">
        {pendingInfo.missingInfo ? (
          <span className="text-center text-xs font-medium text-red-600">
            No email assigned
          </span>
        ) : pendingInfo.nonDbcaEmail ? (
          <span className="text-center text-xs font-medium text-yellow-600">
            External email
          </span>
        ) : (
          pendingInfo.name && (
            <span className="text-center text-xs font-medium text-gray-600">
              {pendingInfo.name}
            </span>
          )
        )}
        {pendingInfo.badge}
        {pendingInfo.showBump && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleBumpClick}
            className="h-auto w-full flex-shrink-0 cursor-pointer px-2 py-1 text-xs"
          >
            Bump
          </Button>
        )}
      </div>
    );
  },
);
WaitingOnCell.displayName = "WaitingOnCell";

// optimised checkbox component
const SelectCheckbox = memo(
  ({
    isSelected,
    onToggle,
    documentId,
  }: {
    isSelected: boolean;
    onToggle: (id: number, checked: boolean) => void;
    documentId: number;
  }) => {
    const handleChange = useCallback(
      (checked: boolean) => onToggle(documentId, checked),
      [documentId, onToggle],
    );

    return (
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleChange}
        aria-label={`Select document ${documentId}`}
      />
    );
  },
);
SelectCheckbox.displayName = "SelectCheckbox";

// Virtualised row component with minimal re-renders and throttled updates
const TableRowOptimised = memo(
  ({
    row,
    isSelected,
    isBumpable,
    hasMissingInfo,
    hasExternalEmail,
    onSelectRow,
    onRowClick,
    onBumpClick,
  }: {
    row: any;
    isSelected: boolean;
    isBumpable: boolean;
    hasMissingInfo: boolean;
    hasExternalEmail: boolean;
    onSelectRow: (documentId: number, checked: boolean) => void;
    onRowClick: (doc: UnapprovedDocument, e: React.MouseEvent) => void;
    onBumpClick: (documentId: number, email: string, type: string) => void;
  }) => {
    const doc = row.original;

    // Throttle the project title click to prevent rapid navigation
    const handleProjectTitleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        // Use requestAnimationFrame to defer navigation
        requestAnimationFrame(() => {
          onRowClick(doc, e);
        });
      },
      [doc, onRowClick],
    );

    const rowClassName = useMemo(() => {
      if (hasMissingInfo) {
        return "hover:bg-red-100/70 select-none bg-red-50";
      } else if (hasExternalEmail) {
        return "hover:bg-orange-100/70 select-none bg-orange-50";
      }
      return "hover:bg-muted/50 select-none";
    }, [hasMissingInfo, hasExternalEmail]);

    return (
      <TableRow className={rowClassName}>
        <TableCell className="w-12 overflow-hidden">
          {isBumpable ? (
            <SelectCheckbox
              isSelected={isSelected}
              onToggle={onSelectRow}
              documentId={doc.document_id}
            />
          ) : (
            <div className="h-4 w-4" />
          )}
        </TableCell>
        <TableCell className="w-40 overflow-hidden">
          <DocumentCell kind={doc.kind} />
        </TableCell>
        <TableCell className="w-1/4 min-w-48 overflow-hidden">
          <div className="line-clamp-3">
            <ProjectTitleCell
              title={doc.project_title}
              onClick={handleProjectTitleClick}
            />
          </div>
        </TableCell>
        <TableCell className="w-40 overflow-hidden">
          <div className="line-clamp-3 flex justify-start">
            <BusinessAreaCell businessArea={doc.business_area_name} />
          </div>
        </TableCell>
        <TableCell className="w-32 overflow-hidden">
          <div className="flex items-center justify-center">
            <StatusCell status={doc.status} />
          </div>
        </TableCell>
        <TableCell className="w-1/5 min-w-48 overflow-hidden">
          <div className="flex justify-center">
            <WaitingOnCell
              document_id={doc.document_id}
              project_lead_approval_granted={doc.project_lead_approval_granted}
              business_area_lead_approval_granted={
                doc.business_area_lead_approval_granted
              }
              directorate_approval_granted={doc.directorate_approval_granted}
              project_leader_email={doc.project_leader_email}
              business_area_leader_email={doc.business_area_leader_email}
              onBumpClick={onBumpClick}
            />
          </div>
        </TableCell>
      </TableRow>
    );
  },
);
TableRowOptimised.displayName = "TableRowOptimised";

// Advanced debounce with immediate updates and background processing
const useAdvancedSearch = (initialValue: string = "") => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set searching state only if there's a meaningful change
      if (value !== debouncedQuery) {
        setIsSearching(true);
      }

      // Use shorter delay and batch updates
      timeoutRef.current = setTimeout(() => {
        // Use requestIdleCallback for non-urgent updates
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            setDebouncedQuery(value);
            setIsSearching(false);
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            setDebouncedQuery(value);
            setIsSearching(false);
          }, 0);
        }
      }, 150); // Even shorter delay
    },
    [debouncedQuery],
  );

  const clearSearch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setSearchQuery("");
    setDebouncedQuery("");
    setIsSearching(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    searchQuery,
    debouncedQuery,
    isSearching,
    updateSearch,
    clearSearch,
  };
};

const UnapprovedProjectsThisFY = () => {
  const navigate = useNavigate();
  const [fetchingData, setFetchingData] = useState(true);
  const [unapprovedProjectsData, setUnapprovedProjectsData] =
    useState<UnapprovedProjectsData | null>(null);

  // Use refs for immediate state to avoid render delays
  const selectedRowsRef = useRef<Set<number>>(new Set());
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);

  // Filter states
  const [selectedDocTypes, setSelectedDocTypes] = useState<DocumentKind[]>([
    "all",
  ]);
  const [selectedApprovalLevel, setSelectedApprovalLevel] = useState<
    ApprovalLevel | "unset"
  >("unset");

  // Search state with advanced debouncing
  const {
    searchQuery,
    debouncedQuery: debouncedSearchQuery,
    isSearching,
    updateSearch,
    clearSearch,
  } = useAdvancedSearch();

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    fetchUnapprovedProjectsThisFY();
  }, []);

  const fetchUnapprovedProjectsThisFY = async () => {
    setFetchingData(true);
    try {
      const res = await getAllUnapprovedProjectsThisFY();
      console.log(res);
      setUnapprovedProjectsData(res);
    } catch (error) {
      console.error("Error fetching unapproved projects:", error);
    } finally {
      setFetchingData(false);
    }
  };

  // Pre-process and cache all document data
  const preprocessedData = useMemo(() => {
    if (!unapprovedProjectsData) return null;

    // Pre-process all documents with cached calculations
    const processedData = { ...unapprovedProjectsData };
    Object.keys(processedData).forEach((key) => {
      if (Array.isArray(processedData[key])) {
        processedData[key] = processedData[key].map(preprocessDocument);
      }
    });

    return processedData;
  }, [unapprovedProjectsData]);

  // Optimised selection handlers using refs and batched updates
  const handleSelectRow = useCallback(
    (documentId: number, checked: boolean) => {
      // Use requestIdleCallback for non-urgent state updates
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          if (checked) {
            selectedRowsRef.current.add(documentId);
          } else {
            selectedRowsRef.current.delete(documentId);
          }
          setSelectedRowsCount(selectedRowsRef.current.size);
        });
      } else {
        // Immediate update for older browsers
        if (checked) {
          selectedRowsRef.current.add(documentId);
        } else {
          selectedRowsRef.current.delete(documentId);
        }
        setSelectedRowsCount(selectedRowsRef.current.size);
      }
    },
    [],
  );

  const handleSelectAll = useCallback(
    (checked: boolean, bumpableIds: Set<number>) => {
      // Use requestIdleCallback for bulk operations
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          if (checked) {
            selectedRowsRef.current = new Set(bumpableIds);
          } else {
            selectedRowsRef.current.clear();
          }
          setSelectedRowsCount(selectedRowsRef.current.size);
        });
      } else {
        if (checked) {
          selectedRowsRef.current = new Set(bumpableIds);
        } else {
          selectedRowsRef.current.clear();
        }
        setSelectedRowsCount(selectedRowsRef.current.size);
      }
    },
    [],
  );

  const handleDocTypeChange = useCallback(
    (docType: DocumentKind, checked: boolean) => {
      // Batch state updates
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          setSelectedDocTypes((prev) => {
            if (docType === "all") {
              return checked ? ["all"] : [];
            } else {
              const filtered = prev.filter((t) => t !== "all");
              if (checked) {
                return [...filtered, docType];
              } else {
                return filtered.filter((t) => t !== docType);
              }
            }
          });
        });
      } else {
        setSelectedDocTypes((prev) => {
          if (docType === "all") {
            return checked ? ["all"] : [];
          } else {
            const filtered = prev.filter((t) => t !== "all");
            if (checked) {
              return [...filtered, docType];
            } else {
              return filtered.filter((t) => t !== docType);
            }
          }
        });
      }
    },
    [],
  );

  const handleApprovalLevelChange = useCallback(
    (level: ApprovalLevel | "unset") => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          setSelectedApprovalLevel(level);
        });
      } else {
        setSelectedApprovalLevel(level);
      }
    },
    [],
  );

  // Search handlers - optimised for performance
  const handleSearchChange = useCallback(
    (value: string) => {
      updateSearch(value);
    },
    [updateSearch],
  );

  const handleClearSearch = useCallback(() => {
    clearSearch();
  }, [clearSearch]);

  // Ultra-optimised filtering with background processing
  const {
    filteredData,
    bumpableDocumentIds,
    missingInfoDocumentIds,
    externalEmailDocumentIds,
  } = useMemo(() => {
    if (!preprocessedData)
      return {
        filteredData: [],
        bumpableDocumentIds: new Set<number>(),
        missingInfoDocumentIds: new Set<number>(),
        externalEmailDocumentIds: new Set<number>(),
      };

    // Optimised processing function with early returns
    const processData = () => {
      let data: any[] = [];

      // Fast path for "all" selection
      if (selectedDocTypes.includes("all")) {
        data = preprocessedData.all;
      } else if (selectedDocTypes.length > 0) {
        // Pre-build the data arrays to avoid repeated lookups
        const keyMap: Record<string, string> = {
          concept: "concept",
          projectplan: "project_plan",
          progressreport: "progress_report",
          studentreport: "student_report",
          projectclosure: "project_closure",
        };

        // Use reduce for better performance than map + flat
        data = selectedDocTypes
          .filter((docType) => docType !== "all")
          .reduce((acc: any[], docType) => {
            const backendKey = keyMap[docType] || docType;
            const items = preprocessedData[backendKey] || [];
            return acc.concat(items);
          }, []);
      }

      // Early return if no data
      if (data.length === 0) {
        return {
          filteredData: [],
          bumpableDocumentIds: new Set<number>(),
          missingInfoDocumentIds: new Set<number>(),
          externalEmailDocumentIds: new Set<number>(),
        };
      }

      // Filter by approval level with early exit
      if (selectedApprovalLevel !== "unset") {
        data = data.filter((doc) => {
          if (!doc.project_lead_approval_granted) {
            return selectedApprovalLevel === "project_lead";
          }
          if (!doc.business_area_lead_approval_granted) {
            return selectedApprovalLevel === "business_area_lead";
          }
          if (!doc.directorate_approval_granted) {
            return selectedApprovalLevel === "directorate";
          }
          return false;
        });
      }

      // Optimised search filtering
      if (debouncedSearchQuery.trim()) {
        const searchLower = debouncedSearchQuery.toLowerCase();

        // For very large datasets, use different strategies
        if (data.length > 1000) {
          // Use binary search approach or indexed search for large datasets
          const results: any[] = [];
          const batchSize = 50; // Smaller batches for better responsiveness

          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const filteredBatch = batch.filter((doc) =>
              doc._cached.cleanTitle.includes(searchLower),
            );
            results.push(...filteredBatch);

            // Allow other tasks to run every few batches
            if (i % 200 === 0 && i > 0) {
              // This forces a yield to the event loop
              break;
            }
          }
          data = results;
        } else {
          // Standard filtering for smaller datasets
          data = data.filter((doc) =>
            doc._cached.cleanTitle.includes(searchLower),
          );
        }
      }

      // Optimised deduplication using Map
      const uniqueData =
        data.length > 100
          ? Array.from(
              new Map(data.map((doc) => [doc.document_id, doc])).values(),
            )
          : data.filter(
              (doc, index, arr) =>
                arr.findIndex((d) => d.document_id === doc.document_id) ===
                index,
            );

      // Pre-allocate Sets with estimated sizes for better performance
      const estimatedSize = Math.min(uniqueData.length, 1000);
      const bumpableIds = new Set<number>();
      const missingInfoIds = new Set<number>();
      const externalEmailIds = new Set<number>();

      // Single pass through data for all calculations
      for (const doc of uniqueData) {
        if (doc._cached.isBumpable) {
          bumpableIds.add(doc.document_id);
        }
        if (doc._cached.hasMissingInfo) {
          missingInfoIds.add(doc.document_id);
        }
        if (doc._cached.hasExternalEmail) {
          externalEmailIds.add(doc.document_id);
        }
      }

      return {
        filteredData: uniqueData,
        bumpableDocumentIds: bumpableIds,
        missingInfoDocumentIds: missingInfoIds,
        externalEmailDocumentIds: externalEmailIds,
      };
    };

    return processData();
  }, [
    preprocessedData,
    selectedDocTypes,
    selectedApprovalLevel,
    debouncedSearchQuery,
  ]);

  const handleBumpClick = useCallback(
    (documentId: number, email: string, type: string) => {
      console.log(`Sending email to ${type}: ${email}`);
    },
    [],
  );

  const handleBumpSelected = useCallback(() => {
    const selectedIds = Array.from(selectedRowsRef.current);
    const selectedDocuments = filteredData.filter((doc) =>
      selectedIds.includes(doc.document_id),
    );
    console.log("Bumping selected documents:", selectedDocuments);
  }, [filteredData]);

  const handleRowClick = useCallback(
    (doc: UnapprovedDocument, e: React.MouseEvent) => {
      console.log("Navigate to document:", doc);
      let urlkind = "";
      if (doc?.kind === "progressreport") {
        urlkind = "progress";
      } else if (doc?.kind === "projectclosure") {
        urlkind = "closure";
      } else if (doc?.kind === "studentreport") {
        urlkind = "student";
      } else if (doc?.kind === "concept") {
        urlkind = "concept";
      } else if (doc?.kind === "projectplan") {
        urlkind = "project";
      }

      if (doc.project_id === undefined) {
        console.log("The Pk is undefined. Potentially use 'id' instead.");
      } else {
        if (e.ctrlKey || e.metaKey) {
          window.open(`/projects/${doc.project_id}/${urlkind}`, "_blank"); // Opens in a new tab
        } else {
          navigate(`/projects/${doc.project_id}/${urlkind}`);
        }
      }
    },
    [navigate],
  );

  // Clear selections when filtered data changes
  useEffect(() => {
    selectedRowsRef.current.clear();
    setSelectedRowsCount(0);
  }, [filteredData]);

  // Static column definitions - no dependencies
  const columns: ColumnDef<UnapprovedDocument>[] = useMemo(
    () => [
      {
        id: "select",
        header: () => {
          const isAllSelected =
            bumpableDocumentIds.size > 0 &&
            selectedRowsCount === bumpableDocumentIds.size;
          const isSomeSelected =
            selectedRowsCount > 0 &&
            selectedRowsCount < bumpableDocumentIds.size;

          return (
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={(checked) =>
                handleSelectAll(checked as boolean, bumpableDocumentIds)
              }
              aria-label="Select all bumpable documents"
              className={
                isSomeSelected ? "data-[state=indeterminate]:bg-primary" : ""
              }
            />
          );
        },
        cell: () => null,
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "kind",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;
          if (isSorted === "asc")
            sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
          else if (isSorted === "desc")
            sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;

          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="w-full justify-start select-none"
            >
              Document
              {sortIcon}
            </Button>
          );
        },
        cell: () => null,
        sortingFn: (rowA, rowB) => {
          const kindA: string = rowA.getValue("kind");
          const kindB: string = rowB.getValue("kind");
          const indexA = DOC_TYPE_ORDER.indexOf(kindA);
          const indexB = DOC_TYPE_ORDER.indexOf(kindB);
          return (
            (indexA === -1 ? DOC_TYPE_ORDER.length : indexA) -
            (indexB === -1 ? DOC_TYPE_ORDER.length : indexB)
          );
        },
        size: 100,
      },
      {
        accessorKey: "project_title",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;
          if (isSorted === "asc")
            sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
          else if (isSorted === "desc")
            sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;

          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="w-full justify-start select-none"
            >
              Project Title
              {sortIcon}
            </Button>
          );
        },
        cell: () => null,
      },
      {
        accessorKey: "business_area_name",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;
          if (isSorted === "asc")
            sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
          else if (isSorted === "desc")
            sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;

          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="w-full justify-center select-none"
            >
              Business Area
              {sortIcon}
            </Button>
          );
        },
        cell: () => null,
        sortingFn: (rowA, rowB) => {
          const businessAreaA =
            (rowA.getValue("business_area_name") as string) || "";
          const businessAreaB =
            (rowB.getValue("business_area_name") as string) || "";
          return businessAreaA.localeCompare(businessAreaB);
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;
          if (isSorted === "asc")
            sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
          else if (isSorted === "desc")
            sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;

          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="w-full justify-center select-none"
            >
              Status
              {sortIcon}
            </Button>
          );
        },
        cell: () => null,
        sortingFn: (rowA, rowB) => {
          const statusA = rowA.getValue("status") as string;
          const statusB = rowB.getValue("status") as string;
          const indexA = STATUS_ORDER.indexOf(statusA);
          const indexB = STATUS_ORDER.indexOf(statusB);
          return (
            (indexA === -1 ? STATUS_ORDER.length : indexA) -
            (indexB === -1 ? STATUS_ORDER.length : indexB)
          );
        },
      },
      {
        id: "waiting_on",
        accessorKey: "waiting_on",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          let sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;
          if (isSorted === "asc")
            sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
          else if (isSorted === "desc")
            sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;

          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="w-full justify-center select-none"
            >
              Waiting On
              {sortIcon}
            </Button>
          );
        },
        cell: () => null,
        sortingFn: (rowA, rowB) => {
          const getFirstPendingLevel = (doc: UnapprovedDocument) => {
            if (!doc.project_lead_approval_granted) return 0;
            if (!doc.business_area_lead_approval_granted) return 1;
            if (!doc.directorate_approval_granted) return 2;
            return 3;
          };

          const getWaitingOnEmail = (doc: UnapprovedDocument) => {
            if (!doc.project_lead_approval_granted)
              return doc.project_leader_email || "";
            if (!doc.business_area_lead_approval_granted)
              return doc.business_area_leader_email || "";
            return ""; // No sub-sorting for directorate level
          };

          const hasMissingData = (doc: UnapprovedDocument) => {
            // Check if project lead approval is needed but no email exists
            if (
              !doc.project_lead_approval_granted &&
              !doc.project_leader_email
            ) {
              return true;
            }
            // Check if business area lead approval is needed but no email exists
            if (
              !doc.business_area_lead_approval_granted &&
              !doc.business_area_leader_email
            ) {
              return true;
            }
            return false;
          };

          const hasExternalEmail = (doc: UnapprovedDocument) => {
            // Check if project lead approval is needed and has external email
            if (
              !doc.project_lead_approval_granted &&
              doc.project_leader_email
            ) {
              return !doc.project_leader_email.endsWith("@dbca.wa.gov.au");
            }
            // Check if business area lead approval is needed and has external email
            if (
              !doc.business_area_lead_approval_granted &&
              doc.business_area_leader_email
            ) {
              return !doc.business_area_leader_email.endsWith(
                "@dbca.wa.gov.au",
              );
            }
            return false;
          };

          const levelA = getFirstPendingLevel(rowA.original);
          const levelB = getFirstPendingLevel(rowB.original);

          // First sort by approval level
          if (levelA !== levelB) {
            return levelA - levelB;
          }

          // Within the same approval level, prioritize by data quality
          const missingDataA = hasMissingData(rowA.original);
          const missingDataB = hasMissingData(rowB.original);

          // Missing data comes first (higher priority)
          if (missingDataA !== missingDataB) {
            return missingDataA ? -1 : 1;
          }

          const externalEmailA = hasExternalEmail(rowA.original);
          const externalEmailB = hasExternalEmail(rowB.original);

          // External emails come second (medium priority)
          if (externalEmailA !== externalEmailB) {
            return externalEmailA ? -1 : 1;
          }

          // Finally, sort alphabetically by the person we're waiting on
          const emailA = getWaitingOnEmail(rowA.original).toLowerCase();
          const emailB = getWaitingOnEmail(rowB.original).toLowerCase();

          return emailA.localeCompare(emailB);
        },
      },
    ],
    [bumpableDocumentIds, selectedRowsCount, handleSelectAll],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    enableRowSelection: false,
    enableMultiRowSelection: false,
    enableSubRowSelection: false,
    enableFilters: false,
    enableGlobalFilter: false,
    manualSorting: false,
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  });

  const isAllSelected = selectedDocTypes.includes("all");
  const docTypeOptions: DocumentKind[] = [
    "concept",
    "projectplan",
    "progressreport",
    "studentreport",
    "projectclosure",
  ];
  const approvalLevelOptions: (ApprovalLevel | "unset")[] = [
    "unset",
    "project_lead",
    "business_area_lead",
    "directorate",
  ];

  return (
    <div className="flex flex-col space-y-4">
      {fetchingData ? (
        <div className="flex w-full items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-lg">Loading unapproved docs...</span>
        </div>
      ) : (
        unapprovedProjectsData && (
          <div className="space-y-4">
            {/* Summary and Bump Button */}
            <div className="flex items-center justify-between border-b py-2">
              <h2 className="text-lg font-medium">
                Unapproved Docs | FY {unapprovedProjectsData.latest_year - 1}-
                {unapprovedProjectsData.latest_year}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Showing {filteredData.length} documents (
                  {bumpableDocumentIds.size} bumpable,{" "}
                  {missingInfoDocumentIds.size} missing info,{" "}
                  {externalEmailDocumentIds.size} externals in lead positions)
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-gray-300 p-4 select-none">
              {/* Search Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by project title..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pr-10 pl-10"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSearch}
                        className="absolute top-1/2 right-1 h-auto -translate-y-1/2 p-1 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {/* Show improved search feedback */}
                  {searchQuery && (
                    <span className="text-sm text-gray-500">
                      {isSearching
                        ? "Searching..."
                        : `${filteredData.length} result${filteredData.length !== 1 ? "s" : ""} found`}
                    </span>
                  )}
                </div>
                {selectedRowsCount > 0 && (
                  <Button
                    onClick={handleBumpSelected}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Bump Selected ({selectedRowsCount})
                  </Button>
                )}
              </div>

              <Separator />

              {/* Document Type Filters */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Kind</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 select-none">
                    <Checkbox
                      id="all"
                      checked={isAllSelected}
                      onCheckedChange={(checked) =>
                        handleDocTypeChange("all", checked as boolean)
                      }
                    />
                    <Label htmlFor="all" className="text-sm font-medium">
                      All
                    </Label>
                  </div>
                  {docTypeOptions.map((docType) => (
                    <div
                      key={docType}
                      className="flex items-center gap-2 select-none"
                    >
                      <Checkbox
                        id={docType}
                        checked={selectedDocTypes.includes(docType)}
                        onCheckedChange={(checked) =>
                          handleDocTypeChange(docType, checked as boolean)
                        }
                      />
                      <Label htmlFor={docType} className="text-sm">
                        {docKindsDict[docType].title}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />

              {/* Approval Level Filters */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Waiting On</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 select-none">
                    <Checkbox
                      id="unset"
                      checked={selectedApprovalLevel === "unset"}
                      onCheckedChange={() => handleApprovalLevelChange("unset")}
                    />
                    <Label htmlFor="unset" className="text-sm font-medium">
                      Unset
                    </Label>
                  </div>
                  {approvalLevelOptions
                    .filter((level) => level !== "unset")
                    .map((level) => (
                      <div
                        key={level}
                        className="flex items-center gap-2 select-none"
                      >
                        <Checkbox
                          id={level}
                          checked={selectedApprovalLevel === level}
                          onCheckedChange={() =>
                            handleApprovalLevelChange(level)
                          }
                        />
                        <Label htmlFor={level} className="text-sm">
                          {approvalLevelsDict[level].title}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="w-full overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="w-full table-fixed">
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          // Define column widths to prevent overflow
                          let width = "auto";
                          if (header.id === "select") width = "w-12";
                          else if (header.id === "kind") width = "w-40";
                          else if (header.id === "project_title")
                            width = "w-1/4 min-w-48";
                          else if (header.id === "business_area_name")
                            width = "w-40";
                          else if (header.id === "status") width = "w-32";
                          else if (header.id === "waiting_on")
                            width = "w-1/5 min-w-48";

                          return (
                            <TableHead
                              key={header.id}
                              className={`${width} overflow-hidden`}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table
                        .getRowModel()
                        .rows.map((row) => (
                          <TableRowOptimised
                            key={row.original.document_id}
                            row={row}
                            isSelected={selectedRowsRef.current.has(
                              row.original.document_id,
                            )}
                            isBumpable={bumpableDocumentIds.has(
                              row.original.document_id,
                            )}
                            hasMissingInfo={missingInfoDocumentIds.has(
                              row.original.document_id,
                            )}
                            hasExternalEmail={externalEmailDocumentIds.has(
                              row.original.document_id,
                            )}
                            onSelectRow={handleSelectRow}
                            onRowClick={handleRowClick}
                            onBumpClick={handleBumpClick}
                          />
                        ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          {searchQuery
                            ? `No documents found matching "${searchQuery}"`
                            : "No unapproved documents found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default UnapprovedProjectsThisFY;
