import { useCallback, useEffect, useState } from "react";

import { reportPhotoService } from "@/services/api";

const normalizeError = (error, fallbackMessage) => {
  return error instanceof Error ? error : new Error(fallbackMessage);
};

const sortPhotos = (photos) => {
  return [...photos].sort(
    (first, second) =>
      Number(first.sort_order ?? 0) - Number(second.sort_order ?? 0),
  );
};

export const useReportPhotos = (reportId, options = {}) => {
  const { autoFetch = true, initialData = [] } = options;

  const [photos, setPhotos] = useState(() =>
    sortPhotos(Array.isArray(initialData) ? initialData : []),
  );

  const [loading, setLoading] = useState(autoFetch && Boolean(reportId));

  const [error, setError] = useState(null);

  const fetchPhotos = useCallback(async () => {
    if (!reportId) {
      setPhotos([]);
      setLoading(false);

      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const result = await reportPhotoService.getAllPhotos(reportId);

      const nextPhotos = Array.isArray(result) ? sortPhotos(result) : [];

      setPhotos(nextPhotos);

      return nextPhotos;
    } catch (error) {
      const normalizedError = normalizeError(
        error,
        "Gagal memuat foto laporan.",
      );

      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  const createPhoto = useCallback(
    async (payload) => {
      if (!reportId) {
        throw new Error("Report ID wajib diisi.");
      }

      setError(null);

      try {
        const photo = await reportPhotoService.createPhoto(reportId, payload);

        if (photo !== null) {
          setPhotos((current) => sortPhotos([...current, photo]));
        }

        return photo;
      } catch (error) {
        const normalizedError = normalizeError(
          error,
          "Gagal menambahkan foto.",
        );

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [reportId],
  );

  const updatePhoto = useCallback(
    async (id, payload) => {
      if (!reportId) {
        throw new Error("Report ID wajib diisi.");
      }

      setError(null);

      try {
        const photo = await reportPhotoService.updatePhoto(
          reportId,
          id,
          payload,
        );

        if (photo !== null) {
          setPhotos((current) =>
            sortPhotos(
              current.map((item) =>
                String(item.id) === String(id) ? photo : item,
              ),
            ),
          );
        }

        return photo;
      } catch (error) {
        const normalizedError = normalizeError(
          error,
          "Gagal memperbarui foto.",
        );

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [reportId],
  );

  const deletePhoto = useCallback(
    async (id) => {
      if (!reportId) {
        throw new Error("Report ID wajib diisi.");
      }

      setError(null);

      try {
        await reportPhotoService.removePhoto(reportId, id);

        setPhotos((current) =>
          current.filter((item) => String(item.id) !== String(id)),
        );

        return true;
      } catch (error) {
        const normalizedError = normalizeError(error, "Gagal menghapus foto.");

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [reportId],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchPhotos();
    }
  }, [autoFetch, fetchPhotos]);

  return {
    photos,
    loading,
    error,
    fetchPhotos,
    createPhoto,
    updatePhoto,
    deletePhoto,
    refresh: fetchPhotos,
  };
};

useReportPhotos.displayName = "useReportPhotos";

export default useReportPhotos;
