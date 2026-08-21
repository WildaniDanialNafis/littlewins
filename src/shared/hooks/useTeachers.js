import { useMemo } from "react";

import { teacherService } from "@/services/api";

import useCrudResource from "./useCrudResource";

const EMPTY_ARRAY = Object.freeze([]);

const MESSAGES = Object.freeze({
  fetch: "Gagal memuat guru.",
  create: "Gagal membuat guru.",
  update: "Gagal memperbarui guru.",
  delete: "Gagal menghapus guru.",
});

const useTeachers = (options = {}) => {
  const {
    autoFetch = true,
    initialData = EMPTY_ARRAY,
    staleTime = 10 * 60 * 1000,
  } = options;

  const resource = useCrudResource({
    service: teacherService,
    resourceKey: "teachers",
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

      createTeacher: resource.create,

      updateTeacher: resource.update,

      deleteTeacher: resource.remove,

      refresh: resource.refresh,
    }),
    [data, resource],
  );
};

useTeachers.displayName = "useTeachers";

export default useTeachers;
