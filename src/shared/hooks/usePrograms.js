import { useMemo } from "react";

import { programService } from "@/services/api";

import useCrudResource from "./useCrudResource";

const EMPTY_ARRAY = Object.freeze([]);

const MESSAGES = Object.freeze({
  fetch: "Gagal memuat program belajar.",
  create: "Gagal membuat program.",
  update: "Gagal memperbarui program.",
  delete: "Gagal menghapus program.",
});

const usePrograms = (options = {}) => {
  const {
    autoFetch = true,
    initialData = EMPTY_ARRAY,
    staleTime = 10 * 60 * 1000,
  } = options;

  const resource = useCrudResource({
    service: programService,
    resourceKey: "programs",
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

      createProgram: resource.create,

      updateProgram: resource.update,

      deleteProgram: resource.remove,

      refresh: resource.refresh,
    }),
    [data, resource],
  );
};

usePrograms.displayName = "usePrograms";

export default usePrograms;
