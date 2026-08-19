import { studentService } from "@/services/api";

import useCrudResource from "./useCrudResource";

const EMPTY_ARRAY = Object.freeze([]);

const MESSAGES = Object.freeze({
  fetch: "Gagal memuat siswa.",

  create: "Gagal membuat siswa.",

  update: "Gagal memperbarui siswa.",

  delete: "Gagal menghapus siswa.",
});

export const useStudents = (options = {}) => {
  const { autoFetch = true, initialData = EMPTY_ARRAY, staleTime } = options;

  const resource = useCrudResource({
    service: studentService,

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

    createStudent: resource.create,

    updateStudent: resource.update,

    deleteStudent: resource.remove,

    refresh: resource.refresh,
  };
};

useStudents.displayName = "useStudents";

export default useStudents;
