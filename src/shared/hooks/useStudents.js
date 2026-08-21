import { useMemo } from "react";

import { studentService } from "@/services/api";

import useCrudResource from "./useCrudResource";

const EMPTY_ARRAY = Object.freeze([]);

const MESSAGES = Object.freeze({
  fetch: "Gagal memuat siswa.",
  create: "Gagal membuat siswa.",
  update: "Gagal memperbarui siswa.",
  delete: "Gagal menghapus siswa.",
});

const useStudents = (options = {}) => {
  const {
    autoFetch = true,
    initialData = EMPTY_ARRAY,
    staleTime = 10 * 60 * 1000,
  } = options;

  const resource = useCrudResource({
    service: studentService,
    resourceKey: "students",
    autoFetch,
    initialData,
    staleTime,
    messages: MESSAGES,
  });

  const data = useMemo(
    () => (Array.isArray(resource.data) ? resource.data : EMPTY_ARRAY),
    [resource.data],
  );

  return useMemo(
    () => ({
      data,

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

      fetchAll: resource.fetchAll,

      createStudent: resource.create,

      updateStudent: resource.update,

      deleteStudent: resource.remove,

      refresh: resource.refresh,
    }),
    [data, resource],
  );
};

useStudents.displayName = "useStudents";

export default useStudents;
