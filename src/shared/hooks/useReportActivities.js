import { reportActivityService } from "@/services/api";

import useReportRelationResource from "./useReportRelationResource";

const METHODS = Object.freeze({
  getAll: (reportId, options = {}) =>
    reportActivityService.getAllActivities(reportId, options),

  create: (reportId, payload, options = {}) =>
    reportActivityService.createActivity(reportId, payload, options),

  update: (reportId, id, payload, options = {}) =>
    reportActivityService.updateActivity(reportId, id, payload, options),

  remove: (reportId, id, options = {}) =>
    reportActivityService.removeActivity(reportId, id, options),
});

const MESSAGES = Object.freeze({
  fetch: "Gagal memuat aktivitas laporan.",

  create: "Gagal membuat aktivitas.",

  update: "Gagal memperbarui aktivitas.",

  delete: "Gagal menghapus aktivitas.",
});

export const useReportActivities = (reportId, options = {}) => {
  const { initialData, autoFetch = true, staleTime } = options;

  const resource = useReportRelationResource({
    reportId,

    methods: METHODS,

    messages: MESSAGES,

    initialData,

    autoFetch,

    staleTime,
  });

  return {
    activities: resource.data,

    loading: resource.loading,

    error: resource.error,

    fetchActivities: resource.fetchItems,

    createActivity: resource.create,

    updateActivity: resource.update,

    deleteActivity: resource.remove,

    refresh: resource.refresh,
  };
};

useReportActivities.displayName = "useReportActivities";

export default useReportActivities;
