import { teacherService } from "@/services/api";

import useCrudResource from "./useCrudResource";

export const useTeachers = (options = {}) => {
  const { autoFetch = true, initialData = [] } = options;

  const resource = useCrudResource({
    service: teacherService,
    autoFetch,
    initialData,
    messages: {
      fetch: "Gagal memuat guru.",
      create: "Gagal membuat guru.",
      update: "Gagal memperbarui guru.",
      delete: "Gagal menghapus guru.",
    },
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
