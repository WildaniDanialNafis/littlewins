import { useCallback, useEffect, useState } from "react";

import { reportService } from "@/services/api";

const normalizeError = (error, fallbackMessage) => {
  return error instanceof Error ? error : new Error(fallbackMessage);
};

export const useReports = (options = {}) => {
  const { autoFetch = true, initialData = [] } = options;

  const [reports, setReports] = useState(initialData);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await reportService.getAll();
      const nextReports = Array.isArray(result) ? result : [];

      setReports(nextReports);

      return nextReports;
    } catch (error) {
      const normalizedError = normalizeError(error, "Gagal memuat laporan.");

      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReport = useCallback(async (id) => {
    setError(null);

    try {
      return await reportService.getById(id);
    } catch (error) {
      const normalizedError = normalizeError(error, "Gagal memuat laporan.");

      setError(normalizedError);
      throw normalizedError;
    }
  }, []);

  const createReport = useCallback(async (payload) => {
    setError(null);

    try {
      const report = await reportService.create(payload);

      if (report !== null) {
        setReports((current) => [...current, report]);
      }

      return report;
    } catch (error) {
      const normalizedError = normalizeError(error, "Gagal membuat laporan.");

      setError(normalizedError);
      throw normalizedError;
    }
  }, []);

  const updateReport = useCallback(async (id, payload) => {
    setError(null);

    try {
      const report = await reportService.update(id, payload);

      if (report !== null) {
        setReports((current) =>
          current.map((item) =>
            String(item.id) === String(id) ? report : item,
          ),
        );
      }

      return report;
    } catch (error) {
      const normalizedError = normalizeError(
        error,
        "Gagal memperbarui laporan.",
      );

      setError(normalizedError);
      throw normalizedError;
    }
  }, []);

  const deleteReport = useCallback(async (id) => {
    setError(null);

    try {
      await reportService.remove(id);

      setReports((current) =>
        current.filter((item) => String(item.id) !== String(id)),
      );

      return true;
    } catch (error) {
      const normalizedError = normalizeError(error, "Gagal menghapus laporan.");

      setError(normalizedError);
      throw normalizedError;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchReports();
    }
  }, [autoFetch, fetchReports]);

  return {
    reports,
    loading,
    error,
    fetchReports,
    getReport,
    createReport,
    updateReport,
    deleteReport,
    refresh: fetchReports,
  };
};

useReports.displayName = "useReports";

export default useReports;
