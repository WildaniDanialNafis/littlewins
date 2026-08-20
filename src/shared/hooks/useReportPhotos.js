import { reportPhotoService } from "@/services/api";

import useReportRelationResource from "./useReportRelationResource";

const PHOTO_STALE_TIME = 5 * 60 * 1000;

const EMPTY_ARRAY = Object.freeze([]);

/* ============================================================
 * SORT
 * ============================================================ */

const sortPhotos = (photos) => {
  if (!Array.isArray(photos) || photos.length < 2) {
    return Array.isArray(photos) ? photos : EMPTY_ARRAY;
  }

  return [...photos].sort((first, second) => {
    const firstOrder = Number(first?.sort_order ?? 0);

    const secondOrder = Number(second?.sort_order ?? 0);

    const firstValue = Number.isFinite(firstOrder) ? firstOrder : 0;

    const secondValue = Number.isFinite(secondOrder) ? secondOrder : 0;

    if (firstValue !== secondValue) {
      return firstValue - secondValue;
    }

    return String(first?.id ?? "").localeCompare(
      String(second?.id ?? ""),
      undefined,
      {
        numeric: true,
      },
    );
  });
};

/* ============================================================
 * METHODS
 * ============================================================ */

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

/* ============================================================
 * NORMALIZATION
 * ============================================================ */

const normalizePhoto = (photo) => {
  if (!photo || typeof photo !== "object") {
    return photo;
  }

  return {
    ...photo,

    id: photo.id ?? photo.photo_id ?? photo.report_photo_id ?? null,

    sort_order: Number.isFinite(Number(photo.sort_order))
      ? Number(photo.sort_order)
      : 0,

    photo_url: photo.photo_url ?? photo.url ?? photo.image_url ?? null,

    photo:
      photo.photo ?? photo.photo_url ?? photo.url ?? photo.image_url ?? null,
  };
};

const normalizePhotos = (value) => {
  return Array.isArray(value) ? value.map(normalizePhoto).filter(Boolean) : [];
};

/* ============================================================
 * HOOK
 * ============================================================ */

export const useReportPhotos = (reportId, options = {}) => {
  const {
    initialData,

    autoFetch = true,

    staleTime = PHOTO_STALE_TIME,

    forceFetchOnMount = false,
  } = options;

  const resource = useReportRelationResource({
    reportId,

    resourceKey: "photos",

    methods: METHODS,

    messages: MESSAGES,

    initialData,

    autoFetch,

    staleTime,

    forceFetchOnMount,

    sortData: sortPhotos,
  });

  return {
    photos: normalizePhotos(resource.data),

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
