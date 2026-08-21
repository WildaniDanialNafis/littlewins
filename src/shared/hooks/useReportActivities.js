import { useMemo } from "react";

import { reportActivityService } from "@/services/api";

import useReportRelationResource from "./useReportRelationResource";

const DEFAULT_STALE_TIME = 60_000;

const EMPTY_ARRAY = Object.freeze([]);

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

const useReportActivities = (reportId, options = {}) => {
  const {
    initialData,
    autoFetch = true,
    staleTime = DEFAULT_STALE_TIME,
    forceFetchOnMount = false,
  } = options;

  const resource = useReportRelationResource({
    reportId,
    resourceKey: "activities",
    methods: METHODS,
    messages: MESSAGES,
    initialData,
    autoFetch,
    staleTime,
    forceFetchOnMount,
  });

  const activities = useMemo(
    () => (Array.isArray(resource.data) ? resource.data : EMPTY_ARRAY),
    [resource.data],
  );

  const fetchActivities = resource.fetchItems ?? resource.fetchAll;

  return useMemo(
    () => ({
      activities,

      loading: resource.isInitialLoading ?? resource.loading ?? false,

      isInitialLoading: resource.isInitialLoading ?? resource.loading ?? false,

      isFetching: resource.isFetching ?? resource.loading ?? false,

      isRefreshing: resource.isRefreshing ?? false,

      error: resource.error ?? null,

      initialError:
        resource.initialError ??
        (resource.isInitialLoading || resource.loading
          ? resource.error
          : null) ??
        null,

      refreshError: resource.refreshError ?? null,

      isCreating: resource.isCreating ?? false,

      isUpdating: resource.isUpdating ?? false,

      isDeleting: resource.isDeleting ?? false,

      isMutating:
        resource.isMutating ??
        Boolean(
          resource.isCreating || resource.isUpdating || resource.isDeleting,
        ),

      fetchActivities,

      createActivity: resource.create,

      updateActivity: resource.update,

      deleteActivity: resource.remove,

      refresh: resource.refresh,
    }),
    [activities, fetchActivities, resource],
  );
};

useReportActivities.displayName = "useReportActivities";

export default useReportActivities;
