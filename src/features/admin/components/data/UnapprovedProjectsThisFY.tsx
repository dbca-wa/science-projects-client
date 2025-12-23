import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getAllUnapprovedProjectsThisFY } from "@/features/admin/services/admin.service";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import {
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
import { Separator } from "@/shared/components/ui/separator";
import { useNavigate } from "react-router-dom";
import type { BumpEmailData } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { BumpEmailModalContent } from "@/features/admin/components/modals/BumpEmailModalContent";

// Types based on backend response
// interface UnapprovedDocument {
//   project_id: number;
//   document_id: number;
//   kind:
//     | "concept"
//     | "projectplan"
//     | "progressreport"
//     | "studentreport"
//     | "projectclosure";
//   project_title: string;
//   project_leader_email: string | null;
//   business_area_leader_email: string | null;
//   business_area_name: string | null;
//   project_lead_approval_granted: boolean;
//   business_area_lead_approval_granted: boolean;
//   directorate_approval_granted: boolean;
//   status: string;
//   created_at: string;
//   modified_at: string;
// }
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

  // Project leader details
  project_leader_id: number | null;
  project_leader_email: string | null;
  project_leader_first_name: string | null;
  project_leader_last_name: string | null;

  // Business area leader details
  business_area_leader_id: number | null;
  business_area_leader_email: string | null;
  business_area_leader_first_name: string | null;
  business_area_leader_last_name: string | null;
  business_area_name: string | null;

  // Action taker details (who needs to approve next)
  user_to_take_action_id: number | null;
  user_to_take_action_email: string | null;
  user_to_take_action_first_name: string | null;
  user_to_take_action_last_name: string | null;
  action_capacity: string | null;

  // Approval status
  project_lead_approval_granted: boolean;
  business_area_lead_approval_granted: boolean;
  directorate_approval_granted: boolean;

  // Document metadata
  status: string;
  created_at: string;
  updated_at: string;

  // Helper fields from backend
  is_bumpable: boolean;
  has_missing_leader_info: boolean;
  has_external_email: boolean;

  // Requesting user details
  requesting_user_id: number;
  requesting_user_email: string;
  requesting_user_first_name: string;
  requesting_user_last_name: string;
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

// // Helper function to determine if a document is bumpable
// const isDocumentBumpable = (doc: UnapprovedDocument): boolean => {
//   // If project lead approval is not granted and we have a DBCA email
//   if (!doc.project_lead_approval_granted) {
//     return isDbcaEmail(doc.project_leader_email);
//   }

//   // If business area lead approval is not granted and we have a DBCA email
//   if (!doc.business_area_lead_approval_granted) {
//     return isDbcaEmail(doc.business_area_leader_email);
//   }

//   // Directorate approvals are not bumpable
//   return false;
// };

// // Helper function to determine if a document has missing leader info
// const hasMissingLeaderInfo = (doc: UnapprovedDocument): boolean => {
//   // Check if project lead approval is needed but no email exists
//   if (!doc.project_lead_approval_granted && !doc.project_leader_email) {
//     return true;
//   }

//   // Check if business area lead approval is needed but no email exists
//   if (
//     !doc.business_area_lead_approval_granted &&
//     !doc.business_area_leader_email
//   ) {
//     return true;
//   }

//   return false;
// };

// // Helper function to determine if a document has external email
// const hasExternalEmailState = (doc: UnapprovedDocument): boolean => {
//   // Check if project lead approval is needed and has external email
//   if (!doc.project_lead_approval_granted && doc.project_leader_email) {
//     return !isDbcaEmail(doc.project_leader_email);
//   }

//   // Check if business area lead approval is needed and has external email
//   if (
//     !doc.business_area_lead_approval_granted &&
//     doc.business_area_leader_email
//   ) {
//     return !isDbcaEmail(doc.business_area_leader_email);
//   }

//   return false;
// };

const isDocumentBumpable = (doc: UnapprovedDocument): boolean => {
  return doc.is_bumpable;
};

const hasMissingLeaderInfo = (doc: UnapprovedDocument): boolean => {
  return doc.has_missing_leader_info;
};

const hasExternalEmailState = (doc: UnapprovedDocument): boolean => {
  return doc.has_external_email;
};

const createBumpDataFromDocument = (
  doc: UnapprovedDocument,
): BumpEmailData | null => {
  // Check if document is bumpable and has required data
  if (
    !doc.is_bumpable ||
    !doc.user_to_take_action_id ||
    !doc.user_to_take_action_email
  ) {
    return null;
  }

  return {
    documentId: doc.document_id,
    documentKind: doc.kind,
    projectId: doc.project_id,
    projectTitle: parseTitle(doc.project_title),
    userToTakeAction: doc.user_to_take_action_id,
    userToTakeActionEmail: doc.user_to_take_action_email,
    userToTakeActionFirstName: doc.user_to_take_action_first_name || "",
    userToTakeActionLastName: doc.user_to_take_action_last_name || "",
    actionCapacity: doc.action_capacity || "",
    requestingUser: doc.requesting_user_id,
    requestingUserEmail: doc.requesting_user_email,
    requestingUserFirstName: doc.requesting_user_first_name,
    requestingUserLastName: doc.requesting_user_last_name,
  };
};

// Pre-process documents to avoid repeated calculations
// const preprocessDocument = (doc: UnapprovedDocument) => {
//   return {
//     ...doc,
//     _cached: {
//       cleanTitle: parseTitle(doc.project_title).toLowerCase(),
//       isBumpable: isDocumentBumpable(doc),
//       hasMissingInfo: hasMissingLeaderInfo(doc),
//       hasExternalEmail: hasExternalEmailState(doc),
//     },
//   };
// };
const preprocessDocument = (doc: UnapprovedDocument) => {
  return {
    ...doc,
    _cached: {
      cleanTitle: parseTitle(doc.project_title).toLowerCase(),
      isBumpable: doc.is_bumpable,
      hasMissingInfo: doc.has_missing_leader_info,
      hasExternalEmail: doc.has_external_email,
    },
  };
};

// Helper function to extract user info from document
const extractUserInfoFromDocument = (doc: UnapprovedDocument) => {
  // Determine who needs to take action and their details
  if (!doc.project_lead_approval_granted && doc.project_leader_email) {
    return {
      email: doc.project_leader_email,
      capacity: "Project Lead",
      userId: null, // TODO
    };
  }

  if (
    !doc.business_area_lead_approval_granted &&
    doc.business_area_leader_email
  ) {
    return {
      email: doc.business_area_leader_email,
      capacity: "Business Area Lead",
      userId: null, // TODO
    };
  }

  return null;
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

// const WaitingOnCell = memo(
//   ({
//     document_id,
//     project_lead_approval_granted,
//     business_area_lead_approval_granted,
//     directorate_approval_granted,
//     project_leader_email,
//     business_area_leader_email,
//     onBumpClick,
//   }: {
//     document_id: number;
//     project_lead_approval_granted: boolean;
//     business_area_lead_approval_granted: boolean;
//     directorate_approval_granted: boolean;
//     project_leader_email: string | null;
//     business_area_leader_email: string | null;
//     onBumpClick: (documentId: number, email: string, type: string) => void;
//   }) => {
//     const pendingInfo = useMemo(() => {
//       // Determine the first pending approval level in hierarchy
//       if (!project_lead_approval_granted) {
//         const hasDbcaEmail = isDbcaEmail(project_leader_email);
//         return {
//           badge: (
//             <Badge
//               key="project"
//               variant="secondary"
//               className="w-full bg-blue-100 py-[5px] text-blue-800"
//             >
//               Project Lead
//             </Badge>
//           ),
//           email: project_leader_email,
//           name: extractNameFromEmail(project_leader_email),
//           type: "Project Lead",
//           showBump: hasDbcaEmail,
//           missingInfo: !project_leader_email,
//           nonDbcaEmail: project_leader_email && !hasDbcaEmail,
//         };
//       }

//       if (!business_area_lead_approval_granted) {
//         const hasDbcaEmail = isDbcaEmail(business_area_leader_email);
//         return {
//           badge: (
//             <Badge
//               key="ba"
//               variant="secondary"
//               className="w-full bg-orange-100 py-[5px] text-orange-800"
//             >
//               BA Lead
//             </Badge>
//           ),
//           email: business_area_leader_email,
//           name: extractNameFromEmail(business_area_leader_email),
//           type: "Business Area Lead",
//           showBump: hasDbcaEmail,
//           missingInfo: !business_area_leader_email,
//           nonDbcaEmail: business_area_leader_email && !hasDbcaEmail,
//         };
//       }

//       if (!directorate_approval_granted) {
//         return {
//           badge: (
//             <Badge
//               key="dir"
//               variant="secondary"
//               className="w-full bg-red-100 py-[5px] text-red-800"
//             >
//               Directorate
//             </Badge>
//           ),
//           email: null,
//           name: null,
//           type: "Directorate",
//           showBump: false,
//           missingInfo: false,
//           nonDbcaEmail: false,
//         };
//       }

//       // All approvals granted - shouldn't happen in this view but handle gracefully
//       return {
//         badge: null,
//         email: null,
//         name: null,
//         type: null,
//         showBump: false,
//         missingInfo: false,
//         nonDbcaEmail: false,
//       };
//     }, [
//       project_lead_approval_granted,
//       business_area_lead_approval_granted,
//       directorate_approval_granted,
//       project_leader_email,
//       business_area_leader_email,
//     ]);

//     const handleBumpClick = useCallback(
//       (e: React.MouseEvent) => {
//         e.stopPropagation();
//         if (pendingInfo.email && pendingInfo.type) {
//           onBumpClick(document_id, pendingInfo.email, pendingInfo.type);
//         }
//       },
//       [document_id, pendingInfo.email, pendingInfo.type, onBumpClick],
//     );

//     if (!pendingInfo.badge) {
//       return <span className="text-sm text-gray-500">All approved</span>;
//     }

//     return (
//       <div className="flex w-full flex-col items-center gap-3">
//         {pendingInfo.missingInfo ? (
//           <span className="text-center text-xs font-medium text-red-600">
//             No email assigned
//           </span>
//         ) : pendingInfo.nonDbcaEmail ? (
//           <span className="text-center text-xs font-medium text-yellow-600">
//             External email
//           </span>
//         ) : (
//           pendingInfo.name && (
//             <span className="text-center text-xs font-medium text-gray-600">
//               {pendingInfo.name}
//             </span>
//           )
//         )}
//         {pendingInfo.badge}
//         {pendingInfo.showBump && (
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={handleBumpClick}
//             className="h-auto w-full flex-shrink-0 cursor-pointer px-2 py-1 text-xs"
//           >
//             Bump
//           </Button>
//         )}
//       </div>
//     );
//   },
// );

const WaitingOnCell = memo(
  ({
    document,
    onBumpClick,
  }: {
    document: UnapprovedDocument;
    onBumpClick: (documentId: number, email: string, type: string) => void;
  }) => {
    const handleBumpClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (document.user_to_take_action_email && document.action_capacity) {
          onBumpClick(
            document.document_id,
            document.user_to_take_action_email,
            document.action_capacity,
          );
        }
      },
      [document, onBumpClick],
    );

    // Determine badge color based on action capacity
    const getBadgeColor = (capacity: string | null) => {
      switch (capacity) {
        case "Project Lead":
          return "bg-blue-100 text-blue-800";
        case "Business Area Lead":
          return "bg-orange-100 text-orange-800";
        case "Directorate":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const displayName = useMemo(() => {
      if (
        document.user_to_take_action_first_name &&
        document.user_to_take_action_last_name
      ) {
        return `${document.user_to_take_action_first_name} ${document.user_to_take_action_last_name}`;
      } else if (document.user_to_take_action_email) {
        return extractNameFromEmail(document.user_to_take_action_email);
      }
      return null;
    }, [document]);

    if (!document.action_capacity) {
      return <span className="text-sm text-gray-500">All approved</span>;
    }

    return (
      <div className="flex w-full flex-col items-center gap-3">
        {document.has_missing_leader_info ? (
          <span className="text-center text-xs font-medium text-red-600">
            No email assigned
          </span>
        ) : document.has_external_email ? (
          <span className="text-center text-xs font-medium text-yellow-600">
            External email
          </span>
        ) : (
          displayName && (
            <span className="text-center text-xs font-medium text-gray-600">
              {displayName}
            </span>
          )
        )}

        <Badge
          variant="secondary"
          className={`w-full py-[5px] ${getBadgeColor(document.action_capacity)}`}
        >
          {document.action_capacity}
        </Badge>

        {document.is_bumpable && (
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
            <WaitingOnCell document={doc} onBumpClick={onBumpClick} />
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

  useEffect(() => {
    if (!fetchingData) console.log(unapprovedProjectsData);
  }, [fetchingData, unapprovedProjectsData]);

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

  // Bump states
  const [isBumpModalOpen, setIsBumpModalOpen] = useState(false);
  const [bumpDocuments, setBumpDocuments] = useState<BumpEmailData[]>([]);
  const [isSingleBump, setIsSingleBump] = useState(false);

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

  // Handle individual document bump (from row button)
  // const handleBumpClick = useCallback(
  //   (documentId: number, email: string, type: string) => {
  //     const document = filteredData.find(
  //       (doc) => doc.document_id === documentId,
  //     );
  //     if (!document) return;

  //     const bumpData: BumpEmailData = {
  //       documentId: document.document_id,
  //       documentKind: document.kind,
  //       projectId: document.project_id,
  //       projectTitle: parseTitle(document.project_title),
  //       userToTakeAction: 0, // TODO
  //       userToTakeActionEmail: email,
  //       actionCapacity: type,
  //       requestingUser: 0, // TODO
  //     };

  //     setBumpDocuments([bumpData]);
  //     setIsSingleBump(true);
  //     setIsBumpModalOpen(true);
  //   },
  //   [filteredData],
  // );

  // // Handle bulk bump (from "Bump Selected" button)
  // const handleBumpSelected = useCallback(() => {
  //   const selectedIds = Array.from(selectedRowsRef.current);
  //   const selectedDocuments = filteredData.filter((doc) =>
  //     selectedIds.includes(doc.document_id),
  //   );

  //   const bumpData: BumpEmailData[] = selectedDocuments
  //     .map((doc) => {
  //       const userInfo = extractUserInfoFromDocument(doc);
  //       if (!userInfo) return null;

  //       return {
  //         documentId: doc.document_id,
  //         documentKind: doc.kind,
  //         projectId: doc.project_id,
  //         projectTitle: parseTitle(doc.project_title),
  //         userToTakeAction: userInfo.userId || 0, // TODO
  //         userToTakeActionEmail: userInfo.email,
  //         actionCapacity: userInfo.capacity,
  //         requestingUser: 0, // TODO
  //       };
  //     })
  //     .filter((item): item is BumpEmailData => item !== null);

  //   if (bumpData.length === 0) {
  //     console.warn("No valid documents to bump");
  //     return;
  //   }

  //   setBumpDocuments(bumpData);
  //   setIsSingleBump(false);
  //   setIsBumpModalOpen(true);
  // }, [filteredData]);

  const handleBumpClick = useCallback(
    (documentId: number, email: string, type: string) => {
      const document = filteredData.find(
        (doc) => doc.document_id === documentId,
      );
      if (!document) return;

      const bumpData = createBumpDataFromDocument(document);
      if (!bumpData) {
        console.warn("Cannot create bump data for document", documentId);
        return;
      }

      setBumpDocuments([bumpData]);
      setIsSingleBump(true);
      setIsBumpModalOpen(true);
    },
    [filteredData],
  );

  const handleBumpSelected = useCallback(() => {
    const selectedIds = Array.from(selectedRowsRef.current);
    const selectedDocuments = filteredData.filter((doc) =>
      selectedIds.includes(doc.document_id),
    );

    const bumpData: BumpEmailData[] = selectedDocuments
      .map(createBumpDataFromDocument)
      .filter((item): item is BumpEmailData => item !== null);

    if (bumpData.length === 0) {
      console.warn("No valid documents to bump");
      return;
    }

    setBumpDocuments(bumpData);
    setIsSingleBump(false);
    setIsBumpModalOpen(true);
  }, [filteredData]);

  const handleCloseBumpModal = () => {
    setIsBumpModalOpen(false);
    setBumpDocuments([]);
    setIsSingleBump(false);
  };

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
        // if (e.ctrlKey || e.metaKey) {
        window.open(`/projects/${doc.project_id}/${urlkind}`, "_blank"); // Opens in a new tab
        // } else {
        //   navigate(`/projects/${doc.project_id}/${urlkind}`);
        // }
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

  const { colorMode } = useColorMode();

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
            {/* Bump Modal */}
            {isBumpModalOpen && (
              <Dialog open={isBumpModalOpen} onOpenChange={handleCloseBumpModal}>
                <DialogContent className={colorMode === "dark" ? "text-gray-400" : ""}>
                  <DialogHeader>
                    <DialogTitle>
                      {isSingleBump ? "Send Bump Email" : "Send Bulk Bump Emails"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <BumpEmailModalContent
                      documentsRequiringAction={bumpDocuments}
                      refreshDataFn={fetchUnapprovedProjectsThisFY}
                      onClose={handleCloseBumpModal}
                      isSingleDocument={isSingleBump}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}

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
                      table.getRowModel().rows.map((row) => {
                        const doc = row.original;
                        return (
                          <TableRowOptimised
                            key={doc.document_id}
                            row={row}
                            isSelected={selectedRowsRef.current.has(
                              doc.document_id,
                            )}
                            isBumpable={doc.is_bumpable}
                            hasMissingInfo={doc.has_missing_leader_info}
                            hasExternalEmail={doc.has_external_email}
                            onSelectRow={handleSelectRow}
                            onRowClick={handleRowClick}
                            onBumpClick={handleBumpClick}
                          />
                        );
                      })
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
