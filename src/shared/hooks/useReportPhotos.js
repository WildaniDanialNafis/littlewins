import { reportPhotoService } from "@/services/api";

import useReportRelationResource from "./useReportRelationResource";

const sortPhotos = (photos) => {
  if (!Array.isArray(photos) || photos.length < 2) {
    return photos ?? [];
  }

  return [...photos].sort((first, second) => {
    const orderDifference =
      Number(first?.sort_order ?? 0) - Number(second?.sort_order ?? 0);

    if (orderDifference !== 0) {
      return orderDifference;
    }

    return String(first?.id ?? "").localeCompare(String(second?.id ?? ""));
  });
};

const METHODS = Object.freeze({
  getAll: (reportId, options = {}) =>
    reportPhotoService.getAllPhotos(reportId, options),

  create: (reportId, payload, options = {}) =>
    reportPhotoService.createPhoto(reportId, payload, options),

  update: (reportId, id, payload, options = {}) =>
    reportPhotoService.updatePhoto(reportId, id, payload, options),

  remove: (reportId, id, options = {}) =>
    reportPhotoService.removePhoto(reportId, id, options),
});

const MESSAGES = Object.freeze({
  fetch: "Gagal memuat foto laporan.",

  create: "Gagal menambahkan foto.",

  update: "Gagal memperbarui foto.",

  delete: "Gagal menghapus foto.",
});

export const useReportPhotos = (reportId, options = {}) => {
  const { initialData, autoFetch = true, staleTime } = options;

  const resource = useReportRelationResource({
    reportId,

    methods: METHODS,

    messages: MESSAGES,

    initialData,

    autoFetch,

    staleTime,

    sortData: sortPhotos,
  });

  return {
    photos: resource.data,

    loading: resource.loading,

    error: resource.error,

    fetchPhotos: resource.fetchItems,

    createPhoto: resource.create,

    updatePhoto: resource.update,

    deletePhoto: resource.remove,

    refresh: resource.refresh,
  };
};

useReportPhotos.displayName = "useReportPhotos";

export default useReportPhotos;
