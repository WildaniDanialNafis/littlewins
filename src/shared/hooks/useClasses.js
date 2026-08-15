import { classService } from "@/services/api";

import useCrudResource from "./useCrudResource";

export const useClasses = (options = {}) => {
  const { autoFetch = true, initialData = [] } = options;

  const resource = useCrudResource({
    service: classService,
    autoFetch,
    initialData,
    messages: {
      fetch: "Gagal memuat data kelas.",
      create: "Gagal membuat kelas.",
      update: "Gagal memperbarui kelas.",
      delete: "Gagal menghapus kelas.",
    },
  });

  return {
    data: resource.data,
    loading: resource.loading,
    error: resource.error,
    fetchAll: resource.fetchAll,
    createClass: resource.create,
    updateClass: resource.update,
    deleteClass: resource.remove,
    refresh: resource.refresh,
  };
};

useClasses.displayName = "useClasses";

export default useClasses;
