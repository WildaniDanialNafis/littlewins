import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

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
  buildEditForm,
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

const EMPTY_ARRAY = Object.freeze([]);

/* ============================================================
 * HELPERS
 * ============================================================ */

const getDisplayName = (item, fallback) => {
  if (!item) {
    return fallback;
  }

  const value =
    item.full_name ??
    item.nama_lengkap ??
    item.name ??
    item.nama ??
    item.title ??
    item.label ??
    "";

  const text = String(value).trim();

  return text || fallback;
};

const mapOptions = (items, fallback) => {
  if (!Array.isArray(items)) {
    return EMPTY_ARRAY;
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

const getErrorMessage = (error, fallback) => {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error.message === "string") {
    return error.message;
  }

  return fallback;
};

const normalizeError = (error, fallback) => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(getErrorMessage(error, fallback) || fallback);
};

const getCurrentUserScope = () => {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEYS.user);

    if (!rawUser) {
      return "anonymous";
    }

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
  if (!isEdit) {
    return "create";
  }

  const normalizedId = normalizeId(reportId);

  if (normalizedId === null) {
    return "edit:invalid";
  }

  return `edit:${normalizedId}`;
};

const getReportMutationConflictKey = (reportId) => {
  const userScope = getCurrentUserScope();

  const normalizedId = normalizeId(reportId);

  if (normalizedId === null) {
    return `report-create:${userScope}`;
  }

  return `report:${userScope}:${normalizedId}`;
};

const getReportMutationOperationKey = (reportId, isEdit) => {
  const userScope = getCurrentUserScope();

  const normalizedId = normalizeId(reportId);

  if (!isEdit || normalizedId === null) {
    return `report-create:${userScope}`;
  }

  return `report-update:${userScope}:${normalizedId}`;
};

const getRelationValues = (items, type) => {
  const field = type === "activity" ? "activity" : "material";

  const fallbackIdFields =
    type === "activity"
      ? ["activity_id", "report_activity_id"]
      : ["material_id", "report_material_id"];

  return normalizeExistingRelations(
    Array.isArray(items) ? items : EMPTY_ARRAY,
    field,
    fallbackIdFields,
  ).map((item) => String(item.value ?? ""));
};

const buildEditState = ({ report, materials, activities }) => {
  const materialValues = getRelationValues(materials, "material");
  const activityValues = getRelationValues(activities, "activity");

  const nextForm = buildEditForm({
    report,
    materials,
    activities,
  });

  return {
    ...nextForm,

    materials: materialValues.length > 0 ? materialValues : [""],

    activities: activityValues,
  };
};

/* ============================================================
 * REDUCER
 * ============================================================ */

const createInitialState = () => ({
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

  reportRefreshing: false,

  reportError: null,

  reportRefreshError: null,
});

const initialState = createInitialState();

const formReducer = (state, action) => {
  switch (action.type) {
    case "RESET_FORM": {
      const payload = action.payload ?? {};

      return {
        ...state,

        form: payload.form ?? cloneEmptyForm(),

        materialDraft: payload.materialDraft ?? [""],

        activityDraft: payload.activityDraft ?? [],

        errors: {},

        submitError: null,

        submitting: false,

        hydratedId: null,

        removedPhotoIds: [],

        currentReport: payload.currentReport ?? null,

        reportLoading: payload.reportLoading ?? false,

        reportRefreshing: payload.reportRefreshing ?? false,

        reportError: payload.reportError ?? null,

        reportRefreshError: payload.reportRefreshError ?? null,
      };
    }

    case "SET_FORM":
      return {
        ...state,
        form: action.payload ?? cloneEmptyForm(),
      };

    case "SET_MATERIAL_DRAFT":
      return {
        ...state,
        materialDraft: Array.isArray(action.payload) ? action.payload : [""],
      };

    case "SET_ACTIVITY_DRAFT":
      return {
        ...state,
        activityDraft: Array.isArray(action.payload) ? action.payload : [],
      };

    case "SET_ERRORS":
      return {
        ...state,
        errors: action.payload ?? {},
      };

    case "SET_SUBMIT_ERROR":
      return {
        ...state,
        submitError: action.payload ?? null,
      };

    case "SET_SUBMITTING":
      return {
        ...state,
        submitting: Boolean(action.payload),
      };

    case "SET_HYDRATED_ID":
      return {
        ...state,
        hydratedId: action.payload ?? null,
      };

    case "SET_REMOVED_PHOTO_IDS":
      return {
        ...state,
        removedPhotoIds: Array.isArray(action.payload) ? action.payload : [],
      };

    case "SET_CURRENT_REPORT":
      return {
        ...state,
        currentReport: action.payload ?? null,
      };

    case "SET_REPORT_LOADING":
      return {
        ...state,
        reportLoading: Boolean(action.payload),
      };

    case "SET_REPORT_REFRESHING":
      return {
        ...state,
        reportRefreshing: Boolean(action.payload),
      };

    case "SET_REPORT_ERROR":
      return {
        ...state,
        reportError: action.payload ?? null,
      };

    case "SET_REPORT_REFRESH_ERROR":
      return {
        ...state,
        reportRefreshError: action.payload ?? null,
      };

    case "UPDATE_FIELD": {
      const { field, value } = action.payload ?? {};

      const nextErrors = {
        ...state.errors,
      };

      if (Object.prototype.hasOwnProperty.call(nextErrors, field)) {
        delete nextErrors[field];
      }

      return {
        ...state,

        form: {
          ...state.form,
          [field]: value,
        },

        errors: Object.keys(nextErrors).length > 0 ? nextErrors : {},

        submitError: null,
      };
    }

    case "UPDATE_RATING": {
      const { field, value } = action.payload ?? {};

      const numeric = Number(value);

      const rating = Number.isFinite(numeric)
        ? Math.min(5, Math.max(0, Math.round(numeric)))
        : 0;

      return {
        ...state,

        form: {
          ...state.form,
          [field]: rating,
        },

        submitError: null,
      };
    }

    case "ADD_PHOTO": {
      const incoming = normalizeImageFiles(action.payload);

      if (incoming.length === 0) {
        return {
          ...state,
          submitError: "Tidak ada file gambar yang valid.",
        };
      }

      const existing = Array.isArray(state.form.photos)
        ? state.form.photos
        : [];

      const keys = new Set(existing.map(createFileKey).filter(Boolean));

      const unique = incoming.filter((file) => {
        const key = createFileKey(file);

        if (!key || keys.has(key)) {
          return false;
        }

        keys.add(key);

        return true;
      });

      if (unique.length === 0) {
        return {
          ...state,
          submitError: "Foto yang dipilih sudah ada.",
        };
      }

      return {
        ...state,

        form: {
          ...state.form,
          photos: [...existing, ...unique],
        },

        submitError: null,
      };
    }

    case "REMOVE_PHOTO": {
      const index = Number(action.payload);

      if (!Number.isInteger(index) || index < 0) {
        return state;
      }

      const photos = Array.isArray(state.form.photos) ? state.form.photos : [];

      if (index >= photos.length) {
        return state;
      }

      return {
        ...state,

        form: {
          ...state.form,

          photos: photos.filter((_, photoIndex) => photoIndex !== index),
        },

        submitError: null,
      };
    }

    case "REMOVE_EXISTING_PHOTO": {
      const id = getPhotoId(action.payload);

      if (id === null) {
        return {
          ...state,
          submitError: "Foto tidak memiliki ID database yang valid.",
        };
      }

      const removed = state.removedPhotoIds.includes(id)
        ? state.removedPhotoIds
        : [...state.removedPhotoIds, id];

      return {
        ...state,

        removedPhotoIds: removed,

        submitError: null,
      };
    }

    default:
      return state;
  }
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
    reportRefreshing,
    reportError,
    reportRefreshError,
  } = state;

  /* ==========================================================
   * REFS
   * ========================================================== */

  const mountedRef = useRef(false);

  const submitLockRef = useRef(false);

  const formIdentityRef = useRef(formIdentity);

  const loadRequestVersionRef = useRef(0);

  const submitRequestVersionRef = useRef(0);

  const userEditingRelationsRef = useRef(false);

  /* ==========================================================
   * LIFECYCLE
   * ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      loadRequestVersionRef.current += 1;

      submitRequestVersionRef.current += 1;

      submitLockRef.current = false;
    };
  }, []);

  /* ==========================================================
   * FORM IDENTITY
   * ========================================================== */

  useEffect(() => {
    const previousIdentity = formIdentityRef.current;

    if (previousIdentity === formIdentity) {
      return;
    }

    formIdentityRef.current = formIdentity;

    loadRequestVersionRef.current += 1;

    submitRequestVersionRef.current += 1;

    submitLockRef.current = false;

    userEditingRelationsRef.current = false;

    dispatch({
      type: "RESET_FORM",

      payload: {
        form: cloneEmptyForm(),

        materialDraft: [""],

        activityDraft: [],

        reportLoading: isEdit && normalizedReportId !== null,

        reportRefreshing: false,

        currentReport: null,

        reportError: null,

        reportRefreshError: null,
      },
    });
  }, [formIdentity, isEdit, normalizedReportId]);

  /* ==========================================================
   * RELATION OPTIONS
   * ========================================================== */

  const {
    data: students = EMPTY_ARRAY,

    isInitialLoading: studentsInitialLoading,

    isRefreshing: studentsRefreshing,

    initialError: studentsInitialError,

    refreshError: studentsRefreshError,
  } = useStudents();

  const {
    data: teachers = EMPTY_ARRAY,

    isInitialLoading: teachersInitialLoading,

    isRefreshing: teachersRefreshing,

    initialError: teachersInitialError,

    refreshError: teachersRefreshError,
  } = useTeachers();

  const {
    data: programs = EMPTY_ARRAY,

    isInitialLoading: programsInitialLoading,

    isRefreshing: programsRefreshing,

    initialError: programsInitialError,

    refreshError: programsRefreshError,
  } = usePrograms();

  const {
    data: classes = EMPTY_ARRAY,

    isInitialLoading: classesInitialLoading,

    isRefreshing: classesRefreshing,

    initialError: classesInitialError,

    refreshError: classesRefreshError,
  } = useClasses();

  /* ==========================================================
   * REPORT SERVICE
   * ========================================================== */

  const { getReport, createReport, updateReport, deleteReport } = useReports({
    autoFetch: false,
  });

  /* ==========================================================
   * REPORT LOAD
   * ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const requestVersion = ++loadRequestVersionRef.current;

    const requestIdentity = formIdentity;

    if (!isEdit || normalizedReportId === null) {
      dispatch({
        type: "SET_REPORT_LOADING",
        payload: false,
      });

      dispatch({
        type: "SET_REPORT_ERROR",
        payload: null,
      });

      return () => {
        cancelled = true;
      };
    }

    dispatch({
      type: "SET_REPORT_LOADING",
      payload: true,
    });

    dispatch({
      type: "SET_REPORT_ERROR",
      payload: null,
    });

    void (async () => {
      try {
        const report = await getReport(normalizedReportId);

        const isCurrent =
          !cancelled &&
          mountedRef.current &&
          requestVersion === loadRequestVersionRef.current &&
          requestIdentity === formIdentityRef.current;

        if (!isCurrent) {
          return;
        }

        if (!report || typeof report !== "object") {
          throw new Error("Laporan tidak ditemukan.");
        }

        dispatch({
          type: "SET_CURRENT_REPORT",
          payload: report,
        });

        dispatch({
          type: "SET_REPORT_ERROR",
          payload: null,
        });
      } catch (error) {
        const isCurrent =
          !cancelled &&
          mountedRef.current &&
          requestVersion === loadRequestVersionRef.current &&
          requestIdentity === formIdentityRef.current;

        if (!isCurrent) {
          return;
        }

        dispatch({
          type: "SET_CURRENT_REPORT",
          payload: null,
        });

        dispatch({
          type: "SET_REPORT_ERROR",
          payload: normalizeError(error, "Gagal memuat laporan."),
        });
      } finally {
        const isCurrent =
          !cancelled &&
          mountedRef.current &&
          requestVersion === loadRequestVersionRef.current &&
          requestIdentity === formIdentityRef.current;

        if (isCurrent) {
          dispatch({
            type: "SET_REPORT_LOADING",
            payload: false,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getReport, isEdit, normalizedReportId, formIdentity]);

  /* ==========================================================
   * REPORT RELATIONS
   * ========================================================== */

  const {
    materials = EMPTY_ARRAY,

    isInitialLoading: materialsInitialLoading,

    isRefreshing: materialsRefreshing,

    initialError: materialsInitialError,

    refreshError: materialsRefreshError,

    refresh: refreshMaterials,
  } = useReportMaterials(normalizedReportId, {
    autoFetch: isEdit && normalizedReportId !== null,
  });

  const {
    activities = EMPTY_ARRAY,

    isInitialLoading: activitiesInitialLoading,

    isRefreshing: activitiesRefreshing,

    initialError: activitiesInitialError,

    refreshError: activitiesRefreshError,

    refresh: refreshActivities,
  } = useReportActivities(normalizedReportId, {
    autoFetch: isEdit && normalizedReportId !== null,
  });

  const {
    photos = EMPTY_ARRAY,

    isInitialLoading: photosInitialLoading,

    isRefreshing: photosRefreshing,

    initialError: photosInitialError,

    refreshError: photosRefreshError,

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
      return EMPTY_ARRAY;
    }

    return photos.filter((photo) => {
      const id = getPhotoId(photo);

      return id !== null && !removed.has(id);
    });
  }, [photos, removedPhotoIds]);

  /* ==========================================================
   * INITIAL / REFRESH STATUS
   * ========================================================== */

  const relationInitialLoading = Boolean(
    materialsInitialLoading || activitiesInitialLoading || photosInitialLoading,
  );

  const relationRefreshing = Boolean(
    materialsRefreshing || activitiesRefreshing || photosRefreshing,
  );

  const studentOptionsLoading = Boolean(studentsInitialLoading);

  const teacherOptionsLoading = Boolean(teachersInitialLoading);

  const programOptionsLoading = Boolean(programsInitialLoading);

  const classOptionsLoading = Boolean(classesInitialLoading);

  const relationOptionsLoading = Boolean(
    studentOptionsLoading ||
    teacherOptionsLoading ||
    programOptionsLoading ||
    classOptionsLoading,
  );

  const relationOptionsRefreshing = Boolean(
    studentsRefreshing ||
    teachersRefreshing ||
    programsRefreshing ||
    classesRefreshing,
  );

  const isInitialLoading = Boolean(
    isEdit &&
    (reportLoading ||
      relationInitialLoading ||
      (normalizedReportId !== null && hydratedId !== normalizedReportId)),
  );

  const isRefreshing = Boolean(
    reportRefreshing || relationRefreshing || relationOptionsRefreshing,
  );

  /* ==========================================================
   * HYDRATION
   * ========================================================== */

  useEffect(() => {
    if (!isEdit || normalizedReportId === null || !currentReport) {
      return;
    }

    if (formIdentityRef.current !== formIdentity) {
      return;
    }

    if (hydratedId === normalizedReportId) {
      return;
    }

    if (reportLoading || relationInitialLoading) {
      return;
    }

    if (userEditingRelationsRef.current) {
      return;
    }

    const nextForm = buildEditState({
      report: currentReport,
      materials,
      activities,
    });

    if (formIdentityRef.current !== formIdentity || !mountedRef.current) {
      return;
    }

    dispatch({
      type: "SET_FORM",
      payload: nextForm,
    });

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

    dispatch({
      type: "SET_HYDRATED_ID",
      payload: normalizedReportId,
    });

    dispatch({
      type: "SET_REMOVED_PHOTO_IDS",
      payload: [],
    });

    dispatch({
      type: "SET_ERRORS",
      payload: {},
    });

    dispatch({
      type: "SET_SUBMIT_ERROR",
      payload: null,
    });
  }, [
    isEdit,
    normalizedReportId,
    formIdentity,
    currentReport,
    reportLoading,
    relationInitialLoading,
    materials,
    activities,
    hydratedId,
  ]);

  /* ==========================================================
   * FORM ACTIONS
   * ========================================================== */

  const updateField = useCallback((field, value) => {
    dispatch({
      type: "UPDATE_FIELD",

      payload: {
        field,
        value,
      },
    });
  }, []);

  const updateRating = useCallback((field, value) => {
    dispatch({
      type: "UPDATE_RATING",

      payload: {
        field,
        value,
      },
    });
  }, []);

  const syncMaterialDraft = useCallback(
    (nextMaterials) => {
      const safe = Array.isArray(nextMaterials) ? nextMaterials : [""];

      dispatch({
        type: "SET_MATERIAL_DRAFT",
        payload: safe,
      });

      dispatch({
        type: "SET_FORM",
        payload: {
          ...form,
          materials: safe,
        },
      });
    },
    [form],
  );

  const addMaterial = useCallback(() => {
    userEditingRelationsRef.current = true;

    syncMaterialDraft([...materialDraft, ""]);

    dispatch({
      type: "SET_SUBMIT_ERROR",
      payload: null,
    });
  }, [materialDraft, syncMaterialDraft]);

  const removeMaterial = useCallback(
    (index) => {
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= materialDraft.length
      ) {
        return;
      }

      userEditingRelationsRef.current = true;

      const next = materialDraft.filter((_, itemIndex) => itemIndex !== index);

      syncMaterialDraft(next.length > 0 ? next : [""]);

      dispatch({
        type: "SET_SUBMIT_ERROR",
        payload: null,
      });
    },
    [materialDraft, syncMaterialDraft],
  );

  const changeMaterial = useCallback(
    (index, value) => {
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= materialDraft.length
      ) {
        return;
      }

      userEditingRelationsRef.current = true;

      const next = [...materialDraft];

      next[index] = value;

      syncMaterialDraft(next);

      dispatch({
        type: "SET_SUBMIT_ERROR",
        payload: null,
      });
    },
    [materialDraft, syncMaterialDraft],
  );

  const syncActivityDraft = useCallback(
    (nextActivities) => {
      const safe = Array.isArray(nextActivities) ? nextActivities : [];

      dispatch({
        type: "SET_ACTIVITY_DRAFT",
        payload: safe,
      });

      dispatch({
        type: "SET_FORM",
        payload: {
          ...form,
          activities: safe,
        },
      });
    },
    [form],
  );

  const addActivity = useCallback(() => {
    userEditingRelationsRef.current = true;

    syncActivityDraft([...activityDraft, ""]);

    dispatch({
      type: "SET_SUBMIT_ERROR",
      payload: null,
    });
  }, [activityDraft, syncActivityDraft]);

  const removeActivity = useCallback(
    (index) => {
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= activityDraft.length
      ) {
        return;
      }

      userEditingRelationsRef.current = true;

      const next = activityDraft.filter((_, itemIndex) => itemIndex !== index);

      syncActivityDraft(next);

      dispatch({
        type: "SET_SUBMIT_ERROR",
        payload: null,
      });
    },
    [activityDraft, syncActivityDraft],
  );

  const changeActivity = useCallback(
    (index, value) => {
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= activityDraft.length
      ) {
        return;
      }

      userEditingRelationsRef.current = true;

      const next = [...activityDraft];

      next[index] = value;

      syncActivityDraft(next);

      dispatch({
        type: "SET_SUBMIT_ERROR",
        payload: null,
      });
    },
    [activityDraft, syncActivityDraft],
  );

  const addPhoto = useCallback((files) => {
    dispatch({
      type: "ADD_PHOTO",
      payload: files,
    });
  }, []);

  const removePhoto = useCallback((index) => {
    dispatch({
      type: "REMOVE_PHOTO",
      payload: index,
    });
  }, []);

  const removeExistingPhoto = useCallback((photo) => {
    dispatch({
      type: "REMOVE_EXISTING_PHOTO",
      payload: photo,
    });
  }, []);

  /* ==========================================================
   * SUBMIT
   * ========================================================== */

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault?.();

      if (submitLockRef.current) {
        return;
      }

      const submitIdentity = formIdentityRef.current;

      const submitVersion = ++submitRequestVersionRef.current;

      const submitForm = {
        ...form,

        materials: [...materialDraft],

        activities: [...activityDraft],
      };

      const validationErrors = getFormErrors(submitForm);

      if (Object.keys(validationErrors).length > 0) {
        dispatch({
          type: "SET_ERRORS",
          payload: validationErrors,
        });

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

      dispatch({
        type: "SET_SUBMITTING",
        payload: true,
      });

      dispatch({
        type: "SET_ERRORS",
        payload: {},
      });

      dispatch({
        type: "SET_SUBMIT_ERROR",
        payload: null,
      });

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

                  materials: submitForm.materials,

                  activities: submitForm.activities,

                  existingMaterials: EMPTY_ARRAY,

                  existingActivities: EMPTY_ARRAY,
                });

                await syncReportPhotos({
                  reportId: newReportId,

                  newPhotos: submitForm.photos,

                  removedPhotoIds: EMPTY_ARRAY,

                  existingPhotos: EMPTY_ARRAY,
                });
              } catch (childError) {
                try {
                  await deleteReport(newReportId);
                } catch (rollbackError) {
                  const rollbackMessage = getErrorMessage(
                    rollbackError,
                    "Rollback laporan gagal.",
                  );

                  const wrapped = new Error(rollbackMessage);

                  wrapped.cause = childError;

                  wrapped.originalError = getErrorMessage(
                    childError,
                    "Sinkronisasi data laporan gagal.",
                  );

                  throw wrapped;
                }

                throw childError;
              }

              const canCommit =
                submitIdentity === formIdentityRef.current &&
                submitVersion === submitRequestVersionRef.current &&
                mountedRef.current;

              if (canCommit) {
                onSuccess?.(createdReport);
              }

              return createdReport;
            }

            /* ==================================================
             * UPDATE
             * ================================================== */

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

            const canCommit =
              submitIdentity === formIdentityRef.current &&
              submitVersion === submitRequestVersionRef.current &&
              mountedRef.current;

            if (canCommit) {
              onSuccess?.(savedReport);
            }

            return savedReport;
          },
        });
      } catch (error) {
        const message = getErrorMessage(
          error,
          isEdit ? "Gagal memperbarui laporan." : "Gagal menyimpan laporan.",
        );

        if (message === FORM_CANCELLED_MESSAGE) {
          return;
        }

        const isStillCurrent =
          submitIdentity === formIdentityRef.current &&
          submitVersion === submitRequestVersionRef.current;

        if (!isStillCurrent || !mountedRef.current) {
          return;
        }

        dispatch({
          type: "SET_SUBMIT_ERROR",
          payload: message,
        });

        dispatch({
          type: "SET_ERRORS",
          payload: {
            form: message,
          },
        });
      } finally {
        const isStillCurrent =
          submitIdentity === formIdentityRef.current &&
          submitVersion === submitRequestVersionRef.current;

        if (isStillCurrent) {
          submitLockRef.current = false;

          if (mountedRef.current) {
            dispatch({
              type: "SET_SUBMITTING",
              payload: false,
            });
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

  /* ==========================================================
   * REFRESH
   * ========================================================== */

  const refresh = useCallback(async () => {
    if (!isEdit || normalizedReportId === null) {
      return true;
    }

    const refreshVersion = ++loadRequestVersionRef.current;

    const refreshIdentity = formIdentityRef.current;

    dispatch({
      type: "SET_REPORT_REFRESHING",
      payload: true,
    });

    dispatch({
      type: "SET_REPORT_REFRESH_ERROR",
      payload: null,
    });

    const results = await Promise.allSettled([
      getReport(normalizedReportId),

      refreshMaterials(),

      refreshActivities(),

      refreshPhotos(),
    ]);

    const isCurrent =
      refreshIdentity === formIdentityRef.current &&
      refreshVersion === loadRequestVersionRef.current &&
      mountedRef.current;

    if (!isCurrent) {
      return false;
    }

    const failed = results.find((result) => result.status === "rejected");

    if (failed) {
      const error = normalizeError(
        failed.reason,
        "Gagal memperbarui data form.",
      );

      dispatch({
        type: "SET_REPORT_REFRESH_ERROR",
        payload: error,
      });

      return false;
    }

    const reportResult = results[0];

    if (reportResult?.status !== "fulfilled") {
      const error = new Error("Gagal memperbarui laporan.");

      dispatch({
        type: "SET_REPORT_REFRESH_ERROR",
        payload: error,
      });

      return false;
    }

    const refreshedReport = reportResult.value;

    if (!refreshedReport || typeof refreshedReport !== "object") {
      const error = new Error("Laporan tidak ditemukan.");

      dispatch({
        type: "SET_REPORT_REFRESH_ERROR",
        payload: error,
      });

      return false;
    }

    userEditingRelationsRef.current = false;

    dispatch({
      type: "SET_CURRENT_REPORT",
      payload: refreshedReport,
    });

    dispatch({
      type: "SET_HYDRATED_ID",
      payload: null,
    });

    dispatch({
      type: "SET_REPORT_ERROR",
      payload: null,
    });

    dispatch({
      type: "SET_REPORT_REFRESH_ERROR",
      payload: null,
    });

    dispatch({
      type: "SET_SUBMIT_ERROR",
      payload: null,
    });

    return true;
  }, [
    getReport,
    isEdit,
    normalizedReportId,
    refreshMaterials,
    refreshActivities,
    refreshPhotos,
  ]);

  useEffect(() => {
    if (!isEdit || normalizedReportId === null) {
      return;
    }

    if (formIdentityRef.current !== formIdentity) {
      return;
    }
  }, [formIdentity, isEdit, normalizedReportId]);

  /* ==========================================================
   * ERROR RESOLUTION
   * ========================================================== */

  const initialError =
    submitError ??
    getErrorMessage(
      reportError ??
        studentsInitialError ??
        teachersInitialError ??
        programsInitialError ??
        classesInitialError ??
        materialsInitialError ??
        activitiesInitialError ??
        photosInitialError,
      null,
    );

  const refreshError =
    reportRefreshError ??
    getErrorMessage(
      studentsRefreshError ??
        teachersRefreshError ??
        programsRefreshError ??
        classesRefreshError ??
        materialsRefreshError ??
        activitiesRefreshError ??
        photosRefreshError,
      null,
    );

  const error = initialError;

  /* ==========================================================
   * RETURN
   * ========================================================== */

  return {
    form: {
      ...form,

      materials: materialDraft,

      activities: activityDraft,
    },

    errors,

    error,

    initialError,

    refreshError,

    submitting,

    isLoading: isInitialLoading,

    isInitialLoading,

    isFetching: Boolean(isInitialLoading || isRefreshing),

    isRefreshing,

    currentReport,

    existingPhotos,

    removedPhotoIds,

    relationOptionsLoading,

    relationOptionsRefreshing,

    studentOptionsLoading,
    teacherOptionsLoading,
    programOptionsLoading,
    classOptionsLoading,

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
