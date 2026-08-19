import { reportMaterialService } from "@/services/api";

import useReportRelationResource from "./useReportRelationResource";

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

export const useReportMaterials = (reportId, options = {}) => {
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
    materials: resource.data,

    loading: resource.loading,

    error: resource.error,

    fetchMaterials: resource.fetchItems,

    createMaterial: resource.create,

    updateMaterial: resource.update,

    deleteMaterial: resource.remove,

    refresh: resource.refresh,
  };
};

useReportMaterials.displayName = "useReportMaterials";

export default useReportMaterials;
