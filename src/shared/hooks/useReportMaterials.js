import { useMemo } from "react";

import { reportMaterialService } from "@/services/api";

import useReportRelationResource from "./useReportRelationResource";

const DEFAULT_STALE_TIME = 60_000;

const EMPTY_ARRAY = Object.freeze([]);

const METHODS = Object.freeze({
  getAll: (reportId, options = {}) =>
    reportMaterialService.getAllMaterials(reportId, options),

  create: (reportId, payload, options = {}) =>
    reportMaterialService.createMaterial(reportId, payload, options),

  update: (reportId, id, payload, options = {}) =>
    reportMaterialService.updateMaterial(reportId, id, payload, options),

  remove: (reportId, id, options = {}) =>
    reportMaterialService.removeMaterial(reportId, id, options),
});

const MESSAGES = Object.freeze({
  fetch: "Gagal memuat materi laporan.",
  create: "Gagal membuat materi.",
  update: "Gagal memperbarui materi.",
  delete: "Gagal menghapus materi.",
});

const useReportMaterials = (reportId, options = {}) => {
  const {
    initialData,
    autoFetch = true,
    staleTime = DEFAULT_STALE_TIME,
    forceFetchOnMount = false,
  } = options;

  const resource = useReportRelationResource({
    reportId,
    resourceKey: "materials",
    methods: METHODS,
    messages: MESSAGES,
    initialData,
    autoFetch,
    staleTime,
    forceFetchOnMount,
  });

  const materials = useMemo(
    () => (Array.isArray(resource.data) ? resource.data : EMPTY_ARRAY),
    [resource.data],
  );

  const fetchMaterials = resource.fetchItems ?? resource.fetchAll;

  return useMemo(
    () => ({
      materials,

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

      fetchMaterials,

      createMaterial: resource.create,

      updateMaterial: resource.update,

      deleteMaterial: resource.remove,

      refresh: resource.refresh,
    }),
    [fetchMaterials, materials, resource],
  );
};

useReportMaterials.displayName = "useReportMaterials";

export default useReportMaterials;
