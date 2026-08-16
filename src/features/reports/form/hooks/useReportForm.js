import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useClasses,
  usePrograms,
  useReportActivities,
  useReportMaterials,
  useReportPhotos,
  useReports,
  useStudents,
  useTeachers,
} from "@/shared/hooks";

import {
  reportMaterialService,
  reportActivityService,
  reportPhotoService,
} from "@/services/api";

import {
  buildReportPayload,
  cloneEmptyForm,
  createFileKey,
  fileToBase64,
  getFormErrors,
  getNextPhotoSortOrder,
  getPhotoId,
  normalizeExistingRelations,
  normalizeId,
  normalizeImageFiles,
  normalizeRelationValues,
} from "../utils/reportFormUtils";

const getDisplayName = (item, fallback) => {
  if (!item) {
    return fallback;
  }

  return (
    item.full_name || item.nama_lengkap || item.name || item.nama || fallback
  );
};

const mapOptions = (items, fallback) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const id = normalizeId(item?.id);

      if (id === null) {
        return null;
      }

      return {
        value: String(id),
        label: getDisplayName(item, `${fallback} ${id}`),
      };
    })
    .filter(Boolean);
};

const getErrorMessage = (error, fallback = "Terjadi kesalahan.") => {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error.message === "string") {
    return error.message;
  }

  return fallback;
};

const getCurrentReport = (reports, reportId) => {
  if (!Array.isArray(reports) || reportId === null) {
    return null;
  }

  return reports.find((report) => normalizeId(report?.id) === reportId) ?? null;
};

const buildEditForm = ({ report, materials, activities }) => {
  const materialValues = normalizeExistingRelations(materials, "material", [
    "material_id",
    "report_material_id",
  ]).map((item) => item.value);

  const activityValues = normalizeExistingRelations(activities, "activity", [
    "activity_id",
    "report_activity_id",
  ]).map((item) => item.value);

  return {
    ...cloneEmptyForm(),

    student_id: report?.student_id != null ? String(report.student_id) : "",

    teacher_id: report?.teacher_id != null ? String(report.teacher_id) : "",

    program_id: report?.program_id != null ? String(report.program_id) : "",

    class_id: report?.class_id != null ? String(report.class_id) : "",

    report_date: report?.report_date ?? "",

    duration: report?.duration != null ? String(report.duration) : "",

    score: report?.score != null ? String(report.score) : "",

    rating_understanding: Number(report?.rating_understanding) || 0,

    rating_activity: Number(report?.rating_activity) || 0,

    rating_discipline: Number(report?.rating_discipline) || 0,

    rating_communication: Number(report?.rating_communication) || 0,

    materials: materialValues.length > 0 ? materialValues : [""],

    activities: activityValues,

    homework: report?.homework ?? "",

    teacher_note: report?.teacher_note ?? "",

    recommendation: report?.recommendation ?? "",

    photos: [],
  };
};

const syncMaterials = async ({ reportId, existing, desired }) => {
  const existingItems = normalizeExistingRelations(existing, "material", [
    "material_id",
    "report_material_id",
  ]);

  const desiredValues = normalizeRelationValues(desired);

  const matchedIds = new Set();

  const valuesToCreate = [];

  desiredValues.forEach((desiredValue) => {
    const match = existingItems.find(
      (item) =>
        !matchedIds.has(item.id) &&
        item.value.toLowerCase() === desiredValue.toLowerCase(),
    );

    if (match) {
      matchedIds.add(match.id);
      return;
    }

    valuesToCreate.push(desiredValue);
  });

  const idsToDelete = existingItems
    .filter((item) => !matchedIds.has(item.id))
    .map((item) => item.id);

  await Promise.all(
    idsToDelete.map((id) => reportMaterialService.removeMaterial(reportId, id)),
  );

  await Promise.all(
    valuesToCreate.map((material) =>
      reportMaterialService.createMaterial(reportId, { material }),
    ),
  );
};

const syncActivities = async ({ reportId, existing, desired }) => {
  const existingItems = normalizeExistingRelations(existing, "activity", [
    "activity_id",
    "report_activity_id",
  ]);

  const desiredValues = normalizeRelationValues(desired);

  const matchedIds = new Set();

  const valuesToCreate = [];

  desiredValues.forEach((desiredValue) => {
    const match = existingItems.find(
      (item) =>
        !matchedIds.has(item.id) &&
        item.value.toLowerCase() === desiredValue.toLowerCase(),
    );

    if (match) {
      matchedIds.add(match.id);
      return;
    }

    valuesToCreate.push(desiredValue);
  });

  const idsToDelete = existingItems
    .filter((item) => !matchedIds.has(item.id))
    .map((item) => item.id);

  await Promise.all(
    idsToDelete.map((id) => reportActivityService.removeActivity(reportId, id)),
  );

  await Promise.all(
    valuesToCreate.map((activity) =>
      reportActivityService.createActivity(reportId, { activity }),
    ),
  );
};

const uploadPhotos = async ({ reportId, files, startOrder }) => {
  const normalizedFiles = normalizeImageFiles(files);

  if (normalizedFiles.length === 0) {
    return [];
  }

  const uploadedPhotos = [];

  /*
   * Satu per satu lebih aman untuk Android
   * dibanding memproses banyak foto sekaligus.
   *
   * Ini mengurangi lonjakan penggunaan memory.
   */
  for (let index = 0; index < normalizedFiles.length; index += 1) {
    const file = normalizedFiles[index];

    const base64 = await fileToBase64(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
    });

    const photo = await reportPhotoService.createPhoto(reportId, {
      photo: base64,
      sort_order: startOrder + index,
    });

    uploadedPhotos.push(photo);
  }

  return uploadedPhotos;
};

const removePhotos = async ({ reportId, photoIds }) => {
  if (!Array.isArray(photoIds)) {
    return;
  }

  const ids = photoIds.map(normalizeId).filter((id) => id !== null);

  await Promise.all(
    ids.map((photoId) => reportPhotoService.removePhoto(reportId, photoId)),
  );
};

const useReportForm = ({
  mode = "create",
  reportId = null,
  onSuccess,
} = {}) => {
  const isEdit = mode === "edit";

  const normalizedReportId = isEdit ? normalizeId(reportId) : null;

  const [form, setForm] = useState(cloneEmptyForm);

  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState(null);

  const [hydratedId, setHydratedId] = useState(null);

  const [removedPhotoIds, setRemovedPhotoIds] = useState([]);

  const {
    data: students = [],
    loading: studentsLoading,
    error: studentsError,
  } = useStudents();

  const {
    data: teachers = [],
    loading: teachersLoading,
    error: teachersError,
  } = useTeachers();

  const {
    data: programs = [],
    loading: programsLoading,
    error: programsError,
  } = usePrograms();

  const {
    data: classes = [],
    loading: classesLoading,
    error: classesError,
  } = useClasses();

  const {
    reports = [],
    loading: reportsLoading,
    error: reportsError,
    createReport,
    updateReport,
  } = useReports({
    autoFetch: isEdit,
  });

  const {
    materials = [],
    loading: materialsLoading,
    error: materialsError,
    refresh: refreshMaterials,
  } = useReportMaterials(normalizedReportId);

  const {
    activities = [],
    loading: activitiesLoading,
    error: activitiesError,
    refresh: refreshActivities,
  } = useReportActivities(normalizedReportId);

  const {
    photos = [],
    loading: photosLoading,
    error: photosError,
    refresh: refreshPhotos,
  } = useReportPhotos(normalizedReportId);

  const currentReport = useMemo(
    () => getCurrentReport(reports, normalizedReportId),
    [reports, normalizedReportId],
  );

  const studentOptions = useMemo(
    () => mapOptions(students, "Siswa"),
    [students],
  );

  const teacherOptions = useMemo(
    () => mapOptions(teachers, "Pengajar"),
    [teachers],
  );

  const programOptions = useMemo(
    () => mapOptions(programs, "Program"),
    [programs],
  );

  const classOptions = useMemo(() => mapOptions(classes, "Kelas"), [classes]);

  const existingPhotos = useMemo(() => {
    const removed = new Set(removedPhotoIds);

    return Array.isArray(photos)
      ? photos.filter((photo) => {
          const id = normalizeId(
            photo?.id ?? photo?.photo_id ?? photo?.report_photo_id,
          );

          return id !== null && !removed.has(id);
        })
      : [];
  }, [photos, removedPhotoIds]);

  useEffect(() => {
    if (!isEdit) {
      setForm(cloneEmptyForm());
      setHydratedId(null);
      setRemovedPhotoIds([]);
      setErrors({});
      setSubmitError(null);

      return;
    }

    if (normalizedReportId === null || !currentReport) {
      return;
    }

    if (materialsLoading || activitiesLoading || photosLoading) {
      return;
    }

    if (hydratedId === normalizedReportId) {
      return;
    }

    setForm(
      buildEditForm({
        report: currentReport,
        materials,
        activities,
      }),
    );

    setHydratedId(normalizedReportId);

    setRemovedPhotoIds([]);
    setErrors({});
    setSubmitError(null);
  }, [
    isEdit,
    normalizedReportId,
    currentReport,
    materials,
    activities,
    materialsLoading,
    activitiesLoading,
    photosLoading,
    hydratedId,
  ]);

  const updateField = useCallback((field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[field];

      return next;
    });

    setSubmitError(null);
  }, []);

  const updateRating = useCallback((field, value) => {
    const rating = Number(value);

    setForm((current) => ({
      ...current,
      [field]:
        Number.isInteger(rating) && rating >= 0 && rating <= 5 ? rating : 0,
    }));

    setErrors((current) => {
      if (!current.rating) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next.rating;

      return next;
    });

    setSubmitError(null);
  }, []);

  const addMaterial = useCallback(() => {
    setForm((current) => ({
      ...current,
      materials: [
        ...(Array.isArray(current.materials) ? current.materials : []),
        "",
      ],
    }));
  }, []);

  const removeMaterial = useCallback((index) => {
    setForm((current) => {
      const materials = Array.isArray(current.materials)
        ? current.materials
        : [];

      const next = materials.filter((_, itemIndex) => itemIndex !== index);

      return {
        ...current,
        materials: next.length > 0 ? next : [""],
      };
    });

    setSubmitError(null);
  }, []);

  const changeMaterial = useCallback((index, value) => {
    setForm((current) => {
      const materials = Array.isArray(current.materials)
        ? [...current.materials]
        : [""];

      materials[index] = value;

      return {
        ...current,
        materials,
      };
    });

    setSubmitError(null);
  }, []);

  const addActivity = useCallback(() => {
    setForm((current) => ({
      ...current,
      activities: [
        ...(Array.isArray(current.activities) ? current.activities : []),
        "",
      ],
    }));
  }, []);

  const removeActivity = useCallback((index) => {
    setForm((current) => ({
      ...current,
      activities: (Array.isArray(current.activities)
        ? current.activities
        : []
      ).filter((_, itemIndex) => itemIndex !== index),
    }));

    setSubmitError(null);
  }, []);

  const changeActivity = useCallback((index, value) => {
    setForm((current) => {
      const activities = Array.isArray(current.activities)
        ? [...current.activities]
        : [];

      activities[index] = value;

      return {
        ...current,
        activities,
      };
    });

    setSubmitError(null);
  }, []);

  const addPhoto = useCallback((files) => {
    const incoming = normalizeImageFiles(files);

    if (incoming.length === 0) {
      setSubmitError("Tidak ada file gambar yang valid.");

      return;
    }

    setForm((current) => {
      const existing = Array.isArray(current.photos) ? current.photos : [];

      const keys = new Set(existing.map(createFileKey));

      const unique = incoming.filter((file) => {
        const key = createFileKey(file);

        if (!key || keys.has(key)) {
          return false;
        }

        keys.add(key);

        return true;
      });

      return {
        ...current,
        photos: [...existing, ...unique],
      };
    });

    setSubmitError(null);
  }, []);

  const removePhoto = useCallback((index) => {
    setForm((current) => ({
      ...current,
      photos: (Array.isArray(current.photos) ? current.photos : []).filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));

    setSubmitError(null);
  }, []);

  const removeExistingPhoto = useCallback((photo) => {
    const id = getPhotoId(photo);

    if (id === null) {
      setSubmitError("Foto tidak memiliki ID database yang valid.");

      return;
    }

    setRemovedPhotoIds((current) =>
      current.includes(id) ? current : [...current, id],
    );

    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (submitting) {
        return;
      }

      const validationErrors = getFormErrors(form);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      if (isEdit && normalizedReportId === null) {
        const message = "ID laporan tidak valid.";

        setSubmitError(message);
        setErrors({
          form: message,
        });

        return;
      }

      if (isEdit && !currentReport) {
        const message = "Laporan yang akan diedit tidak ditemukan.";

        setSubmitError(message);
        setErrors({
          form: message,
        });

        return;
      }

      setSubmitting(true);
      setErrors({});
      setSubmitError(null);

      try {
        const payload = buildReportPayload(form);

        if (!isEdit) {
          const report = await createReport(payload);

          const newReportId = normalizeId(report?.id);

          if (newReportId === null) {
            throw new Error(
              "Laporan berhasil dibuat tetapi ID laporan tidak ditemukan.",
            );
          }

          await syncMaterials({
            reportId: newReportId,
            existing: [],
            desired: form.materials,
          });

          await syncActivities({
            reportId: newReportId,
            existing: [],
            desired: form.activities,
          });

          await uploadPhotos({
            reportId: newReportId,
            files: form.photos,
            startOrder: 0,
          });

          onSuccess?.(report);

          return;
        }

        const updatedReport = await updateReport(normalizedReportId, payload);

        if (!updatedReport) {
          throw new Error("Gagal memperbarui laporan.");
        }

        await syncMaterials({
          reportId: normalizedReportId,
          existing: materials,
          desired: form.materials,
        });

        await syncActivities({
          reportId: normalizedReportId,
          existing: activities,
          desired: form.activities,
        });

        await removePhotos({
          reportId: normalizedReportId,
          photoIds: removedPhotoIds,
        });

        await uploadPhotos({
          reportId: normalizedReportId,
          files: form.photos,
          startOrder: getNextPhotoSortOrder(existingPhotos),
        });

        onSuccess?.(updatedReport);
      } catch (error) {
        const message = getErrorMessage(
          error,
          isEdit ? "Gagal memperbarui laporan." : "Gagal menyimpan laporan.",
        );

        setSubmitError(message);

        setErrors({
          form: message,
        });

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      submitting,
      form,
      isEdit,
      normalizedReportId,
      currentReport,
      createReport,
      updateReport,
      materials,
      activities,
      removedPhotoIds,
      existingPhotos,
      onSuccess,
    ],
  );

  const relationOptionsLoading =
    studentsLoading || teachersLoading || programsLoading || classesLoading;

  const isLoading =
    relationOptionsLoading ||
    (isEdit &&
      (reportsLoading ||
        materialsLoading ||
        activitiesLoading ||
        photosLoading));

  const error =
    submitError ||
    getErrorMessage(
      studentsError ||
        teachersError ||
        programsError ||
        classesError ||
        reportsError ||
        materialsError ||
        activitiesError ||
        photosError,
      null,
    );

  return {
    form,
    errors,

    submitting,
    isLoading,
    error,

    currentReport,
    existingPhotos,
    removedPhotoIds,

    relationOptionsLoading,

    studentOptions,
    teacherOptions,
    programOptions,
    classOptions,

    updateField,
    updateRating,

    addMaterial,
    removeMaterial,
    changeMaterial,

    addActivity,
    removeActivity,
    changeActivity,

    addPhoto,
    removePhoto,
    removeExistingPhoto,

    handleSubmit,

    refresh: async () => {
      await Promise.all([
        refreshMaterials(),
        refreshActivities(),
        refreshPhotos(),
      ]);
    },
  };
};

useReportForm.displayName = "useReportForm";

export default useReportForm;
