import { useCallback, useEffect, useMemo, useRef, useReducer } from "react";

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

import { STORAGE_KEYS } from "@/shared/constants";

import { mutationCoordinator } from "@/shared/utils/mutationCoordinator";

import {
  buildReportPayload,
  cloneEmptyForm,
  createFileKey,
  getFormErrors,
  getPhotoId,
  normalizeExistingRelations,
  normalizeId,
  normalizeImageFiles,
} from "../utils/reportFormUtils";

import { syncReportPhotos, syncReportRelations } from "./useReportFormSync";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const FORM_CANCELLED_MESSAGE = "Operasi form sudah tidak berlaku.";

/* ============================================================
 * HELPERS
 * ============================================================ */

const getDisplayName = (item, fallback) => {
  if (!item) return fallback;
  const value =
    item.full_name ?? item.nama_lengkap ?? item.name ?? item.nama ?? "";
  const text = String(value).trim();
  return text || fallback;
};

const mapOptions = (items, fallback) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const id = normalizeId(item?.id);
      if (id === null) return null;
      return {
        value: String(id),
        label: getDisplayName(item, `${fallback} ${id}`),
      };
    })
    .filter(Boolean);
};

const getErrorMessage = (error, fallback) => {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error.message === "string") return error.message;
  return fallback;
};

const getCurrentUserScope = () => {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEYS.user);
    if (!rawUser) return "anonymous";
    const user = JSON.parse(rawUser);
    const userId = user?.profile?.id ?? user?.id;
    if (userId === null || userId === undefined || userId === "") {
      return "anonymous";
    }
    const role = String(user?.role ?? "unknown")
      .trim()
      .toLowerCase();
    return `${role}:${String(userId)}`;
  } catch {
    return "anonymous";
  }
};

const getFormIdentity = ({ isEdit, reportId }) => {
  if (!isEdit) return "create";
  const normalizedId = normalizeId(reportId);
  if (normalizedId === null) return "edit:invalid";
  return `edit:${normalizedId}`;
};

const getReportMutationConflictKey = (reportId) => {
  const userScope = getCurrentUserScope();
  const normalizedId = normalizeId(reportId);
  if (normalizedId === null) return `report-create:${userScope}`;
  return `report:${userScope}:${normalizedId}`;
};

const getReportMutationOperationKey = (reportId, isEdit) => {
  const userScope = getCurrentUserScope();
  const normalizedId = normalizeId(reportId);
  if (!isEdit || normalizedId === null) return `report-create:${userScope}`;
  return `report-update:${userScope}:${normalizedId}`;
};

const getRelationValues = (items, type) => {
  const field = type === "activity" ? "activity" : "material";
  const normalized = normalizeExistingRelations(
    Array.isArray(items) ? items : [],
    field,
    type === "activity"
      ? ["activity_id", "report_activity_id"]
      : ["material_id", "report_material_id"],
  );
  return normalized.map((item) => String(item.value ?? ""));
};

const buildEditState = ({ report, materials, activities }) => {
  const ratings = report?.ratings ?? {};
  return {
    ...cloneEmptyForm(),
    student_id: report?.student_id != null ? String(report.student_id) : "",
    teacher_id: report?.teacher_id != null ? String(report.teacher_id) : "",
    program_id: report?.program_id != null ? String(report.program_id) : "",
    class_id: report?.class_id != null ? String(report.class_id) : "",
    report_date: report?.report_date ?? "",
    duration: report?.duration != null ? String(report.duration) : "",
    score: report?.score != null ? String(report.score) : "",
    rating_understanding:
      Number(ratings.understanding ?? report?.rating_understanding) || 0,
    rating_activity: Number(ratings.activity ?? report?.rating_activity) || 0,
    rating_discipline:
      Number(ratings.discipline ?? report?.rating_discipline) || 0,
    rating_communication:
      Number(ratings.communication ?? report?.rating_communication) || 0,
    materials:
      getRelationValues(materials, "material").length > 0
        ? getRelationValues(materials, "material")
        : [""],
    activities: getRelationValues(activities, "activity"),
    homework: report?.homework ?? "",
    teacher_note: report?.teacher_note ?? "",
    recommendation: report?.recommendation ?? "",
    photos: [],
  };
};

/* ============================================================
 * REDUCER
 * ============================================================ */

const initialState = {
  form: cloneEmptyForm(),
  materialDraft: [""],
  activityDraft: [],
  errors: {},
  submitError: null,
  submitting: false,
  hydratedId: null,
  removedPhotoIds: [],
  currentReport: null,
  reportLoading: false,
  reportError: null,
};

function formReducer(state, action) {
  switch (action.type) {
    case "RESET_FORM": {
      const {
        form: newForm,
        materialDraft: newMaterialDraft,
        activityDraft: newActivityDraft,
        reportLoading: newReportLoading,
        currentReport: newCurrentReport,
        reportError: newReportError,
      } = action.payload;
      return {
        ...state,
        form: newForm ?? cloneEmptyForm(),
        materialDraft: newMaterialDraft ?? [""],
        activityDraft: newActivityDraft ?? [],
        errors: {},
        submitError: null,
        submitting: false,
        hydratedId: null,
        removedPhotoIds: [],
        currentReport: newCurrentReport ?? null,
        reportLoading: newReportLoading ?? false,
        reportError: newReportError ?? null,
      };
    }

    case "SET_FORM": {
      return { ...state, form: action.payload };
    }

    case "SET_MATERIAL_DRAFT": {
      return { ...state, materialDraft: action.payload };
    }

    case "SET_ACTIVITY_DRAFT": {
      return { ...state, activityDraft: action.payload };
    }

    case "SET_ERRORS": {
      return { ...state, errors: action.payload };
    }

    case "SET_SUBMIT_ERROR": {
      return { ...state, submitError: action.payload };
    }

    case "SET_SUBMITTING": {
      return { ...state, submitting: action.payload };
    }

    case "SET_HYDRATED_ID": {
      return { ...state, hydratedId: action.payload };
    }

    case "SET_REMOVED_PHOTO_IDS": {
      return { ...state, removedPhotoIds: action.payload };
    }

    case "SET_CURRENT_REPORT": {
      return { ...state, currentReport: action.payload };
    }

    case "SET_REPORT_LOADING": {
      return { ...state, reportLoading: action.payload };
    }

    case "SET_REPORT_ERROR": {
      return { ...state, reportError: action.payload };
    }

    case "UPDATE_FIELD": {
      const { field, value } = action.payload;
      return {
        ...state,
        form: { ...state.form, [field]: value },
        errors: state.errors[field]
          ? { ...state.errors, [field]: undefined }
          : state.errors,
        submitError: null,
      };
    }

    case "UPDATE_RATING": {
      const { field, value } = action.payload;
      const numeric = Number(value);
      const rating = Number.isFinite(numeric)
        ? Math.min(5, Math.max(0, Math.round(numeric)))
        : 0;
      return {
        ...state,
        form: { ...state.form, [field]: rating },
        submitError: null,
      };
    }

    case "ADD_PHOTO": {
      const files = action.payload;
      const incoming = normalizeImageFiles(files);
      if (incoming.length === 0) {
        return { ...state, submitError: "Tidak ada file gambar yang valid." };
      }
      const existing = Array.isArray(state.form.photos)
        ? state.form.photos
        : [];
      const keys = new Set(existing.map(createFileKey));
      const unique = incoming.filter((file) => {
        const key = createFileKey(file);
        if (!key || keys.has(key)) return false;
        keys.add(key);
        return true;
      });
      return {
        ...state,
        form: { ...state.form, photos: [...existing, ...unique] },
        submitError: null,
      };
    }

    case "REMOVE_PHOTO": {
      const index = action.payload;
      const photos = (
        Array.isArray(state.form.photos) ? state.form.photos : []
      ).filter((_, i) => i !== index);
      return { ...state, form: { ...state.form, photos }, submitError: null };
    }

    case "REMOVE_EXISTING_PHOTO": {
      const photo = action.payload;
      const id = getPhotoId(photo);
      if (id === null) {
        return {
          ...state,
          submitError: "Foto tidak memiliki ID database yang valid.",
        };
      }
      const removed = state.removedPhotoIds.includes(id)
        ? state.removedPhotoIds
        : [...state.removedPhotoIds, id];
      return { ...state, removedPhotoIds: removed, submitError: null };
    }

    default:
      return state;
  }
}

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

  const formIdentity = useMemo(
    () =>
      getFormIdentity({
        isEdit,
        reportId: normalizedReportId,
      }),
    [isEdit, normalizedReportId],
  );

  const [state, dispatch] = useReducer(formReducer, initialState);

  const {
    form,
    materialDraft,
    activityDraft,
    errors,
    submitError,
    submitting,
    hydratedId,
    removedPhotoIds,
    currentReport,
    reportLoading,
    reportError,
  } = state;

  const mountedRef = useRef(false);
  const submitLockRef = useRef(false);
  const formIdentityRef = useRef(formIdentity);
  const loadRequestVersionRef = useRef(0);
  const submitRequestVersionRef = useRef(0);
  const userEditingRelationsRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      loadRequestVersionRef.current += 1;
      submitRequestVersionRef.current += 1;
      submitLockRef.current = false;
    };
  }, []);

  // Reset form when identity changes
  useEffect(() => {
    const previousIdentity = formIdentityRef.current;
    if (previousIdentity === formIdentity) return;

    formIdentityRef.current = formIdentity;
    loadRequestVersionRef.current += 1;
    submitRequestVersionRef.current += 1;
    submitLockRef.current = false;
    userEditingRelationsRef.current = false;

    if (!isEdit) {
      dispatch({
        type: "RESET_FORM",
        payload: {
          form: cloneEmptyForm(),
          materialDraft: [""],
          activityDraft: [],
          reportLoading: false,
          currentReport: null,
          reportError: null,
        },
      });
      return;
    }

    // Reset for new edit identity
    dispatch({
      type: "RESET_FORM",
      payload: {
        form: cloneEmptyForm(),
        materialDraft: [""],
        activityDraft: [],
        reportLoading: normalizedReportId !== null,
        currentReport: null,
        reportError: null,
      },
    });
  }, [formIdentity, isEdit, normalizedReportId]);

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

  const { getReport, createReport, updateReport, deleteReport } = useReports({
    autoFetch: false,
  });

  // Load report
  useEffect(() => {
    let cancelled = false;
    const requestVersion = ++loadRequestVersionRef.current;
    const requestIdentity = formIdentity;

    if (!isEdit || normalizedReportId === null) {
      dispatch({
        type: "RESET_FORM",
        payload: {
          currentReport: null,
          reportError: null,
          reportLoading: false,
        },
      });
      return () => {
        cancelled = true;
      };
    }

    dispatch({ type: "SET_REPORT_LOADING", payload: true });
    dispatch({ type: "SET_REPORT_ERROR", payload: null });

    void (async () => {
      try {
        const report = await getReport(normalizedReportId);
        const isCurrent =
          !cancelled &&
          mountedRef.current &&
          requestVersion === loadRequestVersionRef.current &&
          requestIdentity === formIdentityRef.current;

        if (!isCurrent) return;

        if (!report || typeof report !== "object") {
          throw new Error("Laporan tidak ditemukan.");
        }

        dispatch({ type: "SET_CURRENT_REPORT", payload: report });
      } catch (error) {
        const isCurrent =
          !cancelled &&
          mountedRef.current &&
          requestVersion === loadRequestVersionRef.current &&
          requestIdentity === formIdentityRef.current;

        if (!isCurrent) return;

        dispatch({ type: "SET_CURRENT_REPORT", payload: null });
        dispatch({
          type: "SET_REPORT_ERROR",
          payload:
            error instanceof Error ? error : new Error("Gagal memuat laporan."),
        });
      } finally {
        const isCurrent =
          !cancelled &&
          mountedRef.current &&
          requestVersion === loadRequestVersionRef.current &&
          requestIdentity === formIdentityRef.current;

        if (isCurrent) {
          dispatch({ type: "SET_REPORT_LOADING", payload: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getReport, isEdit, normalizedReportId, formIdentity]);

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
    if (!Array.isArray(photos)) return [];
    return photos.filter((photo) => {
      const id = getPhotoId(photo);
      return id !== null && !removed.has(id);
    });
  }, [photos, removedPhotoIds]);

  // Hydrate form when edit data is ready
  useEffect(() => {
    if (!isEdit || normalizedReportId === null || !currentReport) return;
    if (formIdentityRef.current !== formIdentity) return;
    if (hydratedId === normalizedReportId) return;
    if (
      reportLoading ||
      materialsLoading ||
      activitiesLoading ||
      photosLoading
    ) {
      return;
    }
    if (userEditingRelationsRef.current) return;

    const nextForm = buildEditState({
      report: currentReport,
      materials,
      activities,
    });

    dispatch({ type: "SET_FORM", payload: nextForm });
    dispatch({
      type: "SET_MATERIAL_DRAFT",
      payload: Array.isArray(nextForm.materials)
        ? [...nextForm.materials]
        : [""],
    });
    dispatch({
      type: "SET_ACTIVITY_DRAFT",
      payload: Array.isArray(nextForm.activities)
        ? [...nextForm.activities]
        : [],
    });
    dispatch({ type: "SET_HYDRATED_ID", payload: normalizedReportId });
    dispatch({ type: "SET_REMOVED_PHOTO_IDS", payload: [] });
    dispatch({ type: "SET_ERRORS", payload: {} });
    dispatch({ type: "SET_SUBMIT_ERROR", payload: null });
  }, [
    isEdit,
    normalizedReportId,
    formIdentity,
    currentReport,
    reportLoading,
    materials,
    activities,
    materialsLoading,
    activitiesLoading,
    photosLoading,
    hydratedId,
  ]);

  const updateField = useCallback((field, value) => {
    dispatch({ type: "UPDATE_FIELD", payload: { field, value } });
  }, []);

  const updateRating = useCallback((field, value) => {
    dispatch({ type: "UPDATE_RATING", payload: { field, value } });
  }, []);

  const syncMaterialDraft = useCallback(
    (nextMaterials) => {
      const safe = Array.isArray(nextMaterials) ? nextMaterials : [""];
      dispatch({ type: "SET_MATERIAL_DRAFT", payload: safe });
      dispatch({
        type: "SET_FORM",
        payload: { ...form, materials: safe },
      });
    },
    [form],
  );

  const addMaterial = useCallback(() => {
    userEditingRelationsRef.current = true;
    const next = [...materialDraft, ""];
    syncMaterialDraft(next);
    dispatch({ type: "SET_SUBMIT_ERROR", payload: null });
  }, [materialDraft, syncMaterialDraft]);

  const removeMaterial = useCallback(
    (index) => {
      userEditingRelationsRef.current = true;
      const next = materialDraft.filter((_, i) => i !== index);
      syncMaterialDraft(next.length > 0 ? next : [""]);
      dispatch({ type: "SET_SUBMIT_ERROR", payload: null });
    },
    [materialDraft, syncMaterialDraft],
  );

  const changeMaterial = useCallback(
    (index, value) => {
      userEditingRelationsRef.current = true;
      const next = [...materialDraft];
      if (index < 0 || index >= next.length) return;
      next[index] = value;
      syncMaterialDraft(next);
      dispatch({ type: "SET_SUBMIT_ERROR", payload: null });
    },
    [materialDraft, syncMaterialDraft],
  );

  const syncActivityDraft = useCallback(
    (nextActivities) => {
      const safe = Array.isArray(nextActivities) ? nextActivities : [];
      dispatch({ type: "SET_ACTIVITY_DRAFT", payload: safe });
      dispatch({
        type: "SET_FORM",
        payload: { ...form, activities: safe },
      });
    },
    [form],
  );

  const addActivity = useCallback(() => {
    userEditingRelationsRef.current = true;
    syncActivityDraft([...activityDraft, ""]);
    dispatch({ type: "SET_SUBMIT_ERROR", payload: null });
  }, [activityDraft, syncActivityDraft]);

  const removeActivity = useCallback(
    (index) => {
      userEditingRelationsRef.current = true;
      syncActivityDraft(activityDraft.filter((_, i) => i !== index));
      dispatch({ type: "SET_SUBMIT_ERROR", payload: null });
    },
    [activityDraft, syncActivityDraft],
  );

  const changeActivity = useCallback(
    (index, value) => {
      userEditingRelationsRef.current = true;
      const next = [...activityDraft];
      if (index < 0 || index >= next.length) return;
      next[index] = value;
      syncActivityDraft(next);
      dispatch({ type: "SET_SUBMIT_ERROR", payload: null });
    },
    [activityDraft, syncActivityDraft],
  );

  const addPhoto = useCallback((files) => {
    dispatch({ type: "ADD_PHOTO", payload: files });
  }, []);

  const removePhoto = useCallback((index) => {
    dispatch({ type: "REMOVE_PHOTO", payload: index });
  }, []);

  const removeExistingPhoto = useCallback((photo) => {
    dispatch({ type: "REMOVE_EXISTING_PHOTO", payload: photo });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (submitLockRef.current) return;

      const submitIdentity = formIdentityRef.current;
      const submitVersion = ++submitRequestVersionRef.current;

      const submitForm = {
        ...form,
        materials: [...materialDraft],
        activities: [...activityDraft],
      };

      const validationErrors = getFormErrors(submitForm);
      if (Object.keys(validationErrors).length > 0) {
        dispatch({ type: "SET_ERRORS", payload: validationErrors });
        return;
      }

      if (isEdit && normalizedReportId === null) {
        dispatch({
          type: "SET_SUBMIT_ERROR",
          payload: "ID laporan tidak valid.",
        });
        return;
      }

      if (isEdit && !currentReport) {
        dispatch({
          type: "SET_SUBMIT_ERROR",
          payload: "Laporan yang akan diedit tidak ditemukan.",
        });
        return;
      }

      const submitReportId = normalizedReportId;
      const submitCurrentReport = currentReport;
      const submitMaterials = [...materials];
      const submitActivities = [...activities];
      const submitRemovedPhotoIds = [...removedPhotoIds];
      const submitExistingPhotos = [...existingPhotos];

      submitLockRef.current = true;
      dispatch({ type: "SET_SUBMITTING", payload: true });
      dispatch({ type: "SET_ERRORS", payload: {} });
      dispatch({ type: "SET_SUBMIT_ERROR", payload: null });

      const conflictKey = getReportMutationConflictKey(submitReportId);
      const operationKey = getReportMutationOperationKey(
        submitReportId,
        isEdit,
      );

      try {
        await mutationCoordinator.run({
          conflictKey,
          operationKey,
          task: async () => {
            const isStillCurrent =
              submitIdentity === formIdentityRef.current &&
              submitVersion === submitRequestVersionRef.current;

            if (!isStillCurrent) {
              throw new Error(FORM_CANCELLED_MESSAGE);
            }

            const payload = buildReportPayload(submitForm);

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
                  materials: submitForm.materials,
                  activities: submitForm.activities,
                  existingMaterials: [],
                  existingActivities: [],
                });

                await syncReportPhotos({
                  reportId: newReportId,
                  newPhotos: submitForm.photos,
                  removedPhotoIds: [],
                  existingPhotos: [],
                });
              } catch (childError) {
                try {
                  await deleteReport(newReportId);
                } catch (rollbackError) {
                  const error =
                    rollbackError instanceof Error
                      ? rollbackError
                      : new Error(String(rollbackError));
                  error.details = {
                    originalError:
                      childError instanceof Error
                        ? childError.message
                        : String(childError),
                  };
                  throw error;
                }
                throw childError;
              }

              const canCommitCreateResult =
                submitIdentity === formIdentityRef.current &&
                submitVersion === submitRequestVersionRef.current &&
                mountedRef.current;

              if (!canCommitCreateResult) {
                return createdReport;
              }

              onSuccess?.(createdReport);
              return createdReport;
            }

            // UPDATE
            const updatedReport = await updateReport(submitReportId, payload);
            const savedReport = updatedReport ?? {
              ...(submitCurrentReport ?? {}),
              ...payload,
              id: submitReportId,
            };

            await syncReportRelations({
              reportId: submitReportId,
              materials: submitForm.materials,
              activities: submitForm.activities,
              existingMaterials: submitMaterials,
              existingActivities: submitActivities,
            });

            await syncReportPhotos({
              reportId: submitReportId,
              newPhotos: submitForm.photos,
              removedPhotoIds: submitRemovedPhotoIds,
              existingPhotos: submitExistingPhotos,
            });

            const canCommitUpdateResult =
              submitIdentity === formIdentityRef.current &&
              submitVersion === submitRequestVersionRef.current &&
              mountedRef.current;

            if (!canCommitUpdateResult) {
              return savedReport;
            }

            onSuccess?.(savedReport);
            return savedReport;
          },
        });
      } catch (error) {
        const message = getErrorMessage(
          error,
          isEdit ? "Gagal memperbarui laporan." : "Gagal menyimpan laporan.",
        );

        if (message === FORM_CANCELLED_MESSAGE) return;

        const isStillCurrent =
          submitIdentity === formIdentityRef.current &&
          submitVersion === submitRequestVersionRef.current;

        if (!isStillCurrent || !mountedRef.current) return;

        dispatch({ type: "SET_SUBMIT_ERROR", payload: message });
        dispatch({ type: "SET_ERRORS", payload: { form: message } });
      } finally {
        const isStillCurrent =
          submitIdentity === formIdentityRef.current &&
          submitVersion === submitRequestVersionRef.current;

        if (isStillCurrent) {
          submitLockRef.current = false;
          if (mountedRef.current) {
            dispatch({ type: "SET_SUBMITTING", payload: false });
          }
        }
      }
    },
    [
      form,
      materialDraft,
      activityDraft,
      isEdit,
      normalizedReportId,
      currentReport,
      materials,
      activities,
      removedPhotoIds,
      existingPhotos,
      createReport,
      updateReport,
      deleteReport,
      onSuccess,
    ],
  );

  const relationOptionsLoading = Boolean(
    studentsLoading || teachersLoading || programsLoading || classesLoading,
  );

  const isLoading = Boolean(
    isEdit &&
    (reportLoading ||
      (normalizedReportId !== null && hydratedId !== normalizedReportId)),
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

  const refresh = useCallback(async () => {
    if (!isEdit || normalizedReportId === null) return true;

    const refreshVersion = ++loadRequestVersionRef.current;
    const refreshIdentity = formIdentityRef.current;

    const results = await Promise.allSettled([
      getReport(normalizedReportId),
      refreshMaterials(),
      refreshActivities(),
      refreshPhotos(),
    ]);

    if (
      refreshIdentity !== formIdentityRef.current ||
      refreshVersion !== loadRequestVersionRef.current ||
      !mountedRef.current
    ) {
      return false;
    }

    const reportResult = results[0];
    const failed = results.find((result) => result.status === "rejected");

    if (failed) {
      throw failed.reason instanceof Error
        ? failed.reason
        : new Error("Gagal memperbarui data form.");
    }

    if (reportResult?.status !== "fulfilled") {
      throw new Error("Gagal memperbarui laporan.");
    }

    const refreshedReport = reportResult.value;
    if (!refreshedReport || typeof refreshedReport !== "object") {
      throw new Error("Laporan tidak ditemukan.");
    }

    dispatch({ type: "SET_CURRENT_REPORT", payload: refreshedReport });
    dispatch({ type: "SET_HYDRATED_ID", payload: null });
    dispatch({ type: "SET_REPORT_ERROR", payload: null });
    dispatch({ type: "SET_SUBMIT_ERROR", payload: null });

    return true;
  }, [
    getReport,
    isEdit,
    normalizedReportId,
    refreshMaterials,
    refreshActivities,
    refreshPhotos,
  ]);

  return {
    form: {
      ...form,
      materials: materialDraft,
      activities: activityDraft,
    },
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
