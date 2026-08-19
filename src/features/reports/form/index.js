export { default as ReportFormPage } from "./pages/ReportFormPage";

export { default as ReportForm } from "./components/ReportForm";

export { default as ReportFormSection } from "./components/ReportFormSection";

export { default as ReportPhotoSection } from "./components/ReportPhotoSection";

export { default as useReportForm } from "./hooks/useReportForm";

export {
  syncMaterials,
  syncActivities,
  uploadPhotos,
  removePhotos,
  syncReportRelations,
  syncReportPhotos,
} from "./hooks/useReportFormSync";

export {
  EMPTY_REPORT_FORM,
  buildEditForm,
  buildReportPayload,
  clampRating,
  cloneEmptyForm,
  createEmptyReportForm,
  createFileKey,
  fileToBase64,
  getFormErrors,
  getNextPhotoSortOrder,
  getPhotoId,
  normalizeExistingRelations,
  normalizeId,
  normalizeImageFiles,
  normalizeRelationComparisonValue,
  normalizeRelationValues,
} from "./utils/reportFormUtils";
