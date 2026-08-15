import { useCallback, useEffect, useState } from "react";

import { reportMaterialService } from "@/services/api";

const normalizeError = (error, fallbackMessage) => {
  return error instanceof Error ? error : new Error(fallbackMessage);
};

export const useReportMaterials = (reportId, options = {}) => {
  const { autoFetch = true, initialData = [] } = options;

  const [materials, setMaterials] = useState(initialData);
  const [loading, setLoading] = useState(autoFetch && Boolean(reportId));
  const [error, setError] = useState(null);

  const fetchMaterials = useCallback(async () => {
    if (!reportId) {
      setMaterials([]);
      setLoading(false);

      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const result = await reportMaterialService.getAllMaterials(reportId);

      const nextMaterials = Array.isArray(result) ? result : [];

      setMaterials(nextMaterials);

      return nextMaterials;
    } catch (error) {
      const normalizedError = normalizeError(
        error,
        "Gagal memuat materi laporan.",
      );

      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  const createMaterial = useCallback(
    async (payload) => {
      if (!reportId) {
        throw new Error("Report ID wajib diisi.");
      }

      setError(null);

      try {
        const material = await reportMaterialService.createMaterial(
          reportId,
          payload,
        );

        if (material !== null) {
          setMaterials((current) => [...current, material]);
        }

        return material;
      } catch (error) {
        const normalizedError = normalizeError(error, "Gagal membuat materi.");

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [reportId],
  );

  const updateMaterial = useCallback(
    async (id, payload) => {
      if (!reportId) {
        throw new Error("Report ID wajib diisi.");
      }

      setError(null);

      try {
        const material = await reportMaterialService.updateMaterial(
          reportId,
          id,
          payload,
        );

        if (material !== null) {
          setMaterials((current) =>
            current.map((item) =>
              String(item.id) === String(id) ? material : item,
            ),
          );
        }

        return material;
      } catch (error) {
        const normalizedError = normalizeError(
          error,
          "Gagal memperbarui materi.",
        );

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [reportId],
  );

  const deleteMaterial = useCallback(
    async (id) => {
      if (!reportId) {
        throw new Error("Report ID wajib diisi.");
      }

      setError(null);

      try {
        await reportMaterialService.removeMaterial(reportId, id);

        setMaterials((current) =>
          current.filter((item) => String(item.id) !== String(id)),
        );

        return true;
      } catch (error) {
        const normalizedError = normalizeError(
          error,
          "Gagal menghapus materi.",
        );

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [reportId],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchMaterials();
    }
  }, [autoFetch, fetchMaterials]);

  return {
    materials,
    loading,
    error,
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    refresh: fetchMaterials,
  };
};

useReportMaterials.displayName = "useReportMaterials";

export default useReportMaterials;
