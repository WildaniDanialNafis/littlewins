import { classService } from "@/services/api";

import useCrudResource from "./useCrudResource";

const EMPTY_ARRAY = Object.freeze([]);

const MESSAGES = Object.freeze({
  fetch: "Gagal memuat data kelas.",

  create: "Gagal membuat kelas.",

  update: "Gagal memperbarui kelas.",

  delete: "Gagal menghapus kelas.",
});

export const useClasses = (options = {}) => {
  const {
    autoFetch = true,

    initialData = EMPTY_ARRAY,

    staleTime = 10 * 60 * 1000,
  } = options;

  const resource = useCrudResource({
    service: classService,

    resourceKey: "classes",

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

    createClass: resource.create,

    updateClass: resource.update,

    deleteClass: resource.remove,

    refresh: resource.refresh,
  };
};

useClasses.displayName = "useClasses";

export default useClasses;
