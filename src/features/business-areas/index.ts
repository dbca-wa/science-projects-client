// Business Areas Feature Module
// Public API exports

// Components
export { BusinessAreaEditableDisplay } from "./components/BusinessAreaEditableDisplay";
export { EditMyBusinessAreaModal } from "./components/EditMyBusinessAreaModal";
export { ProblematicProjectsDataTable } from "./components/ProblematicProjectsDataTable";
export { UnapprovedDocumentsDataTable } from "./components/UnapprovedDocumentsDataTable";

// Modals
export { SetAreasModal } from "./components/modals/SetAreasModal";

// Hooks
export { useBusinessArea } from "./hooks/useBusinessArea";
export { useBusinessAreas } from "./hooks/useBusinessAreas";
export { useMyBusinessAreas } from "./hooks/useMyBusinessAreas";
export { useCheckUserIsBaLeader } from "./hooks/useCheckUserIsBaLeader";

// Services
export {
  getAllBusinessAreas,
  getMyBusinessAreas,
  getSingleBusinessArea,
  createBusinessArea,
  updateBusinessArea,
  deleteBusinessArea,
  activateBusinessArea,
} from "./services/business-areas.service";

export type { BusinessAreaUpdateProps } from "./services/business-areas.service";

// Types
export type {
  BusinessAreaImage,
  IBusinessArea,
  IBusinessAreaCreate,
  IBusinessAreaUpdate,
} from "./types/business-areas.types";
