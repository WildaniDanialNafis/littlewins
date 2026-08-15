import { programService } from "@/services/api";

import useCrudResource from "./useCrudResource";

export const usePrograms = (options = {}) => {
  const { autoFetch = true, initialData = [] } = options;

  const resource = useCrudResource({
    service: programService,
    autoFetch,
    initialData,
    messages: {
      fetch: "Gagal memuat program belajar.",
      create: "Gagal membuat program.",
      update: "Gagal memperbarui program.",
      delete: "Gagal menghapus program.",
    },
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
