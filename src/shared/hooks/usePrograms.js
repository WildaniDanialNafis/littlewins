import { programService } from "@/services/api";

import useCrudResource from "./useCrudResource";

const EMPTY_ARRAY = Object.freeze([]);

const MESSAGES = Object.freeze({
  fetch: "Gagal memuat program belajar.",

  create: "Gagal membuat program.",

  update: "Gagal memperbarui program.",

  delete: "Gagal menghapus program.",
});

export const usePrograms = (options = {}) => {
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

  return {
    data: resource.data,

    loading: resource.loading,

    error: resource.error,

    fetchAll: resource.fetchAll,

    createProgram: resource.create,

    updateProgram: resource.update,

    deleteProgram: resource.remove,

    refresh: resource.refresh,
  };
};

usePrograms.displayName = "usePrograms";

export default usePrograms;
