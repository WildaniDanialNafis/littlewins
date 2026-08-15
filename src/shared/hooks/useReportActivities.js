import { useCallback, useEffect, useState } from "react";

import { reportActivityService } from "@/services/api";

const normalizeError = (error, fallbackMessage) => {
  return error instanceof Error ? error : new Error(fallbackMessage);
};

export const useReportActivities = (reportId, options = {}) => {
  const { autoFetch = true, initialData = [] } = options;

  const [activities, setActivities] = useState(initialData);
  const [loading, setLoading] = useState(autoFetch && Boolean(reportId));
  const [error, setError] = useState(null);

  const fetchActivities = useCallback(async () => {
    if (!reportId) {
      setActivities([]);
      setLoading(false);

      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const result = await reportActivityService.getAllActivities(reportId);

      const nextActivities = Array.isArray(result) ? result : [];

      setActivities(nextActivities);

      return nextActivities;
    } catch (error) {
      const normalizedError = normalizeError(
        error,
        "Gagal memuat aktivitas laporan.",
      );

      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  const createActivity = useCallback(
    async (payload) => {
      if (!reportId) {
        throw new Error("Report ID wajib diisi.");
      }

      setError(null);

      try {
        const activity = await reportActivityService.createActivity(
          reportId,
          payload,
        );

        if (activity !== null) {
          setActivities((current) => [...current, activity]);
        }

        return activity;
      } catch (error) {
        const normalizedError = normalizeError(
          error,
          "Gagal membuat aktivitas.",
        );

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [reportId],
  );

  const updateActivity = useCallback(
    async (id, payload) => {
      if (!reportId) {
        throw new Error("Report ID wajib diisi.");
      }

      setError(null);

      try {
        const activity = await reportActivityService.updateActivity(
          reportId,
          id,
          payload,
        );

        if (activity !== null) {
          setActivities((current) =>
            current.map((item) =>
              String(item.id) === String(id) ? activity : item,
            ),
          );
        }

        return activity;
      } catch (error) {
        const normalizedError = normalizeError(
          error,
          "Gagal memperbarui aktivitas.",
        );

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [reportId],
  );

  const deleteActivity = useCallback(
    async (id) => {
      if (!reportId) {
        throw new Error("Report ID wajib diisi.");
      }

      setError(null);

      try {
        await reportActivityService.removeActivity(reportId, id);

        setActivities((current) =>
          current.filter((item) => String(item.id) !== String(id)),
        );

        return true;
      } catch (error) {
        const normalizedError = normalizeError(
          error,
          "Gagal menghapus aktivitas.",
        );

        setError(normalizedError);
        throw normalizedError;
      }
    },
    [reportId],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchActivities();
    }
  }, [autoFetch, fetchActivities]);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    refresh: fetchActivities,
  };
};

useReportActivities.displayName = "useReportActivities";

export default useReportActivities;
