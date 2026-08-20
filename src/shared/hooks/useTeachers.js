import { teacherService } from "@/services/api";

import useCrudResource from "./useCrudResource";

const EMPTY_ARRAY = Object.freeze([]);

const MESSAGES = Object.freeze({
  fetch: "Gagal memuat guru.",

  create: "Gagal membuat guru.",

  update: "Gagal memperbarui guru.",

  delete: "Gagal menghapus guru.",
});

export const useTeachers = (options = {}) => {
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

  return {
    data: resource.data,

    loading: resource.loading,

    error: resource.error,

    fetchAll: resource.fetchAll,

    createTeacher: resource.create,

    updateTeacher: resource.update,

    deleteTeacher: resource.remove,

    refresh: resource.refresh,
  };
};

useTeachers.displayName = "useTeachers";

export default useTeachers;
