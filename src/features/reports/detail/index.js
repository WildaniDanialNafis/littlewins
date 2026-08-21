export {
  PhotoLightbox,
  PhotoThumbnail,
  ReportHeader,
  ReportLearning,
  ReportPhotos,
  ReportProgress,
  ReportRecommendation,
  ReportScore,
  ReportSummary,
  ReportTeacherNote,
} from "./components";

export { default as ReportDetailPage } from "./pages/ReportDetailPage";

export { default as useLightbox } from "./hooks/useLightbox";

export { default as useReportDetail } from "./hooks/useReportDetail";

export { default as ReportDetailSkeleton } from "./components/ReportDetailSkeleton";

export {
  createLookupMap,
  formatReportDate,
  getName,
  getNilaiStyle,
  getNilaiBand,
  getReportNames,
  hasValue,
  normalizeId,
  normalizeReportView,
} from "./utils/reportDetailUtils";
