import { useMemo } from "react";

import { reportPhotoService } from "@/services/api";

import useReportRelationResource from "./useReportRelationResource";

const PHOTO_STALE_TIME = 5 * 60 * 1000;

const EMPTY_ARRAY = Object.freeze([]);

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

const normalizePhoto = (photo) => {
  if (!photo || typeof photo !== "object") {
    return photo;
  }

  const id = photo.id ?? photo.photo_id ?? photo.report_photo_id ?? null;

  const numericSortOrder = Number(photo.sort_order);

  const sortOrder = Number.isFinite(numericSortOrder) ? numericSortOrder : 0;

  const photoUrl = photo.photo_url ?? photo.url ?? photo.image_url ?? null;

  const photoValue = photo.photo ?? photoUrl ?? null;

  /*
   * Preserve identity when normalization
   * does not change the value.
   */
  if (
    photo.id === id &&
    photo.sort_order === sortOrder &&
    photo.photo_url === photoUrl &&
    photo.photo === photoValue
  ) {
    return photo;
  }

  return {
    ...photo,

    id,

    sort_order: sortOrder,

    photo_url: photoUrl,

    photo: photoValue,
  };
};

const normalizePhotos = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    return EMPTY_ARRAY;
  }

  let changed = false;

  const normalized = new Array(value.length);

  let writeIndex = 0;

  for (let index = 0; index < value.length; index += 1) {
    const normalizedPhoto = normalizePhoto(value[index]);

    if (normalizedPhoto !== value[index]) {
      changed = true;
    }

    if (!normalizedPhoto) {
      changed = true;
      continue;
    }

    normalized[writeIndex] = normalizedPhoto;

    writeIndex += 1;
  }

  if (writeIndex !== value.length) {
    changed = true;
    normalized.length = writeIndex;
  }

  return changed ? normalized : value;
};

const useReportPhotos = (reportId, options = {}) => {
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

  const photos = useMemo(() => normalizePhotos(resource.data), [resource.data]);

  const fetchPhotos = resource.fetchItems ?? resource.fetchAll;

  return useMemo(
    () => ({
      photos,

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

      fetchPhotos,

      createPhoto: resource.create,

      updatePhoto: resource.update,

      deletePhoto: resource.remove,

      refresh: resource.refresh,
    }),
    [fetchPhotos, photos, resource],
  );
};

useReportPhotos.displayName = "useReportPhotos";

export default useReportPhotos;
