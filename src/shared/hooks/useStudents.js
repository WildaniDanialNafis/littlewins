import { studentService } from "@/services/api";

import useCrudResource from "./useCrudResource";

export const useStudents = (options = {}) => {
  const { autoFetch = true, initialData = [] } = options;

  const resource = useCrudResource({
    service: studentService,
    autoFetch,
    initialData,
    messages: {
      fetch: "Gagal memuat siswa.",
      create: "Gagal membuat siswa.",
      update: "Gagal memperbarui siswa.",
      delete: "Gagal menghapus siswa.",
    },
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
