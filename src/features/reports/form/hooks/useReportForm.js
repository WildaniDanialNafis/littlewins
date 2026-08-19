import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  buildReportPayload,
  cloneEmptyForm,
  createFileKey,
  getFormErrors,
  getPhotoId,
  normalizeExistingRelations,
  normalizeId,
  normalizeImageFiles,
  normalizeRelationValues,
} from "../utils/reportFormUtils";

import { syncReportPhotos, syncReportRelations } from "./useReportFormSync";

/* ============================================================
 * HELPERS
 * ============================================================ */

const getDisplayName = (item, fallback) => {
  if (!item) {
    return fallback;
  }

  const value =
    item.full_name ?? item.nama_lengkap ?? item.name ?? item.nama ?? "";

  const normalized = String(value).trim();

  return normalized || fallback;
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

/* ============================================================
 * HOOK
 * ============================================================ */

const useReportForm = ({
  mode = "create",
  reportId = null,
  onSuccess,
} = {}) => {
  const isEdit = mode === "edit";

  const normalizedReportId = isEdit ? normalizeId(reportId) : null;

  const [form, setForm] = useState(cloneEmptyForm);

  const [errors, setErrors] = useState({});

  const [submitError, setSubmitError] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [hydratedId, setHydratedId] = useState(null);

  const [removedPhotoIds, setRemovedPhotoIds] = useState([]);

  const mountedRef = useRef(false);

  const submitLockRef = useRef(false);

  /* ==========================================================
   * LIFECYCLE
   * ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ==========================================================
   * LOOKUPS
   * ========================================================== */

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

  /* ==========================================================
   * REPORT
   *
   * IMPORTANT:
   * Edit tidak lagi fetch seluruh reports list.
   * ========================================================== */

  const { getReport, createReport, updateReport, deleteReport } = useReports({
    autoFetch: false,
  });

  const [currentReport, setCurrentReport] = useState(null);

  const [reportLoading, setReportLoading] = useState(
    Boolean(isEdit && normalizedReportId !== null),
  );

  const [reportError, setReportError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!isEdit || normalizedReportId === null) {
      setCurrentReport(null);
      setReportLoading(false);
      setReportError(null);

      return () => {
        cancelled = true;
      };
    }

    setReportLoading(true);
    setReportError(null);

    const loadReport = async () => {
      try {
        const report = await getReport(normalizedReportId);

        if (cancelled || !mountedRef.current) {
          return;
        }

        if (!report || typeof report !== "object") {
          setCurrentReport(null);

          setReportError(new Error("Laporan tidak ditemukan."));

          return;
        }

        setCurrentReport(report);
      } catch (error) {
        if (cancelled || !mountedRef.current) {
          return;
        }

        setCurrentReport(null);

        setReportError(
          error instanceof Error ? error : new Error("Gagal memuat laporan."),
        );
      } finally {
        if (!cancelled && mountedRef.current) {
          setReportLoading(false);
        }
      }
    };

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [getReport, isEdit, normalizedReportId]);

  /* ==========================================================
   * RELATIONS
   * ========================================================== */

  const {
    materials = [],
    loading: materialsLoading,
    error: materialsError,
    refresh: refreshMaterials,
  } = useReportMaterials(normalizedReportId, {
    autoFetch: isEdit && normalizedReportId !== null,
  });

  const {
    activities = [],
    loading: activitiesLoading,
    error: activitiesError,
    refresh: refreshActivities,
  } = useReportActivities(normalizedReportId, {
    autoFetch: isEdit && normalizedReportId !== null,
  });

  const {
    photos = [],
    loading: photosLoading,
    error: photosError,
    refresh: refreshPhotos,
  } = useReportPhotos(normalizedReportId, {
    autoFetch: isEdit && normalizedReportId !== null,
  });

  /* ==========================================================
   * OPTIONS
   * ========================================================== */

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

  /* ==========================================================
   * EXISTING PHOTOS
   * ========================================================== */

  const existingPhotos = useMemo(() => {
    const removed = new Set(removedPhotoIds);

    if (!Array.isArray(photos)) {
      return [];
    }

    return photos.filter((photo) => {
      const id = getPhotoId(photo);

      return id !== null && !removed.has(id);
    });
  }, [photos, removedPhotoIds]);

  /* ==========================================================
   * HYDRATE EDIT FORM
   * ========================================================== */

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

    if (
      reportLoading ||
      materialsLoading ||
      activitiesLoading ||
      photosLoading
    ) {
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
    reportLoading,
    materials,
    activities,
    materialsLoading,
    activitiesLoading,
    photosLoading,
    hydratedId,
  ]);

  /* ==========================================================
   * FIELD
   * ========================================================== */

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

  /* ==========================================================
   * MATERIALS
   * ========================================================== */

  const addMaterial = useCallback(() => {
    setForm((current) => ({
      ...current,

      materials: [...normalizeRelationValues(current.materials), ""],
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

      if (index < 0 || index >= materials.length) {
        return current;
      }

      materials[index] = value;

      return {
        ...current,
        materials,
      };
    });

    setSubmitError(null);
  }, []);

  /* ==========================================================
   * ACTIVITIES
   * ========================================================== */

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

      if (index < 0 || index >= activities.length) {
        return current;
      }

      activities[index] = value;

      return {
        ...current,
        activities,
      };
    });

    setSubmitError(null);
  }, []);

  /* ==========================================================
   * PHOTOS
   * ========================================================== */

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

  /* ==========================================================
   * SUBMIT
   * ========================================================== */

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (submitLockRef.current) {
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

      submitLockRef.current = true;

      setSubmitting(true);
      setErrors({});
      setSubmitError(null);

      try {
        const payload = buildReportPayload(form);

        /* ==================================================
         * CREATE
         * ================================================== */

        if (!isEdit) {
          const createdReport = await createReport(payload);

          const newReportId = normalizeId(createdReport?.id);

          if (newReportId === null) {
            throw new Error(
              "Laporan berhasil dibuat tetapi ID laporan tidak ditemukan.",
            );
          }

          try {
            await syncReportRelations({
              reportId: newReportId,

              materials: form.materials,

              activities: form.activities,

              existingMaterials: [],

              existingActivities: [],
            });

            await syncReportPhotos({
              reportId: newReportId,

              newPhotos: form.photos,

              removedPhotoIds: [],

              existingPhotos: [],
            });
          } catch (childError) {
            /*
             * Parent sudah berhasil,
             * child gagal.
             *
             * Rollback parent untuk
             * menghindari orphan report.
             */
            try {
              await deleteReport(newReportId);
            } catch (rollbackError) {
              throw new Error(
                `${getErrorMessage(
                  childError,
                  "Gagal menyimpan detail laporan.",
                )} Rollback laporan utama juga gagal: ${getErrorMessage(
                  rollbackError,
                  "Unknown error.",
                )}`,
              );
            }

            throw childError;
          }

          if (mountedRef.current) {
            onSuccess?.(createdReport);
          }

          return;
        }

        /* ==================================================
         * UPDATE
         * ================================================== */

        const updatedReport = await updateReport(normalizedReportId, payload);

        if (!updatedReport) {
          throw new Error("Gagal memperbarui laporan.");
        }

        await syncReportRelations({
          reportId: normalizedReportId,

          materials: form.materials,

          activities: form.activities,

          existingMaterials: materials,

          existingActivities: activities,
        });

        await syncReportPhotos({
          reportId: normalizedReportId,

          newPhotos: form.photos,

          removedPhotoIds: removedPhotoIds,

          existingPhotos: existingPhotos,
        });

        if (mountedRef.current) {
          onSuccess?.(updatedReport);
        }
      } catch (error) {
        if (mountedRef.current) {
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
        }
      } finally {
        submitLockRef.current = false;

        if (mountedRef.current) {
          setSubmitting(false);
        }
      }
    },
    [
      form,
      isEdit,
      normalizedReportId,
      currentReport,
      createReport,
      updateReport,
      deleteReport,
      materials,
      activities,
      removedPhotoIds,
      existingPhotos,
      onSuccess,
    ],
  );

  /* ==========================================================
   * STATE
   * ========================================================== */

  const relationOptionsLoading = Boolean(
    studentsLoading || teachersLoading || programsLoading || classesLoading,
  );

  const isLoading = Boolean(
    relationOptionsLoading ||
    reportLoading ||
    materialsLoading ||
    activitiesLoading ||
    photosLoading,
  );

  const error =
    submitError ||
    getErrorMessage(
      reportError ||
        studentsError ||
        teachersError ||
        programsError ||
        classesError ||
        materialsError ||
        activitiesError ||
        photosError,
      null,
    );

  /* ==========================================================
   * REFRESH
   * ========================================================== */

  const refresh = useCallback(async () => {
    const tasks = [];

    if (isEdit && normalizedReportId !== null) {
      tasks.push(
        getReport(normalizedReportId),
        refreshMaterials(),
        refreshActivities(),
        refreshPhotos(),
      );
    }

    const results = await Promise.allSettled(tasks);

    const failed = results.find((result) => result.status === "rejected");

    if (failed) {
      throw failed.reason instanceof Error
        ? failed.reason
        : new Error("Gagal memperbarui data form.");
    }
  }, [
    getReport,
    isEdit,
    normalizedReportId,
    refreshMaterials,
    refreshActivities,
    refreshPhotos,
  ]);

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
    refresh,
  };
};

useReportForm.displayName = "useReportForm";

export default useReportForm;
