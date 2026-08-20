import {
  reportActivityService,
  reportMaterialService,
  reportPhotoService,
} from "@/services/api";

import { getResourceKey, invalidateResource } from "@/shared/cache";

import { STORAGE_KEYS } from "@/shared/constants";

import {
  fileToBase64,
  getNextPhotoSortOrder,
  getPhotoId,
  normalizeId,
  normalizeImageFiles,
  normalizeRelationComparisonValue,
} from "../utils/reportFormUtils";

/* ============================================================
 * HELPERS
 * ============================================================ */

const getCurrentUserScope = () => {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEYS.user);

    if (!rawUser) {
      return null;
    }

    const user = JSON.parse(rawUser);

    const userId = user?.profile?.id ?? user?.id;

    if (userId === null || userId === undefined || userId === "") {
      return null;
    }

    return `${String(user?.role ?? "unknown")
      .trim()
      .toLowerCase()}:${String(userId)}`;
  } catch {
    return null;
  }
};

const invalidateReportRelationCaches = (reportId) => {
  const normalizedReportId = normalizeId(reportId);

  const userScope = getCurrentUserScope();

  if (normalizedReportId === null || !userScope) {
    return;
  }

  const resourceNames = ["materials", "activities", "photos"];

  for (const resourceName of resourceNames) {
    invalidateResource(
      getResourceKey({
        scope: `user:${userScope}`,

        resource: `report:${normalizedReportId}:${resourceName}`,
      }),
    );
  }

  /*
   * Backward compatibility:
   *
   * Cache versi lama menggunakan:
   * report:{id}:relation
   */
  invalidateResource(
    getResourceKey({
      scope: `user:${userScope}`,

      resource: `report:${normalizedReportId}:relation`,
    }),
  );
};

/* ============================================================
 * RELATION CONFIG
 * ============================================================ */

const RELATION_CONFIG = Object.freeze({
  material: {
    create: reportMaterialService.createMaterial.bind(reportMaterialService),

    remove: reportMaterialService.removeMaterial.bind(reportMaterialService),

    getId: (item) =>
      normalizeId(item?.id ?? item?.material_id ?? item?.report_material_id),

    getValue: (item) => item?.material ?? item?.value ?? item?.name ?? "",
  },

  activity: {
    create: reportActivityService.createActivity.bind(reportActivityService),

    remove: reportActivityService.removeActivity.bind(reportActivityService),

    getId: (item) =>
      normalizeId(item?.id ?? item?.activity_id ?? item?.report_activity_id),

    getValue: (item) => item?.activity ?? item?.value ?? item?.name ?? "",
  },
});

/* ============================================================
 * ERROR
 * ============================================================ */

export const createReportSyncError = (
  message,
  {
    cause = null,
    created = [],
    deleted = [],
    restored = [],
    operation = null,
    partial = false,
    rollbackFailed = [],
  } = {},
) => {
  const error = new Error(message);

  error.name = "ReportSyncError";

  error.cause = cause;

  error.created = created;

  error.deleted = deleted;

  error.restored = restored;

  error.operation = operation;

  error.partial = partial;

  error.rollbackFailed = rollbackFailed;

  return error;
};

/* ============================================================
 * NORMALIZE
 * ============================================================ */

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

const getDesiredValues = (values) => {
  if (!Array.isArray(values)) {
    return [];
  }

  const result = [];

  const seen = new Set();

  for (const value of values) {
    const text = normalizeText(value);

    const key = normalizeRelationComparisonValue(text);

    if (!key) {
      continue;
    }

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    result.push(text);
  }

  return result;
};

const getExistingItems = (items, type) => {
  const config = RELATION_CONFIG[type];

  if (!config || !Array.isArray(items)) {
    return [];
  }

  const result = [];

  const seenIds = new Set();

  const seenValues = new Set();

  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const id = config.getId(item);

    const value = normalizeText(config.getValue(item));

    const key = normalizeRelationComparisonValue(value);

    if (id === null || !key) {
      continue;
    }

    if (seenIds.has(id) || seenValues.has(key)) {
      continue;
    }

    seenIds.add(id);

    seenValues.add(key);

    result.push({
      ...item,

      id,

      value,

      normalized: key,
    });
  }

  return result;
};

/* ============================================================
 * PLAN
 * ============================================================ */

const buildRelationPlan = ({ existing, desired, type }) => {
  const existingItems = getExistingItems(existing, type);

  const desiredValues = getDesiredValues(desired);

  const existingByValue = new Map();

  for (const item of existingItems) {
    if (!existingByValue.has(item.normalized)) {
      existingByValue.set(item.normalized, item);
    }
  }

  const keep = [];

  const create = [];

  for (const value of desiredValues) {
    const key = normalizeRelationComparisonValue(value);

    const existingItem = existingByValue.get(key);

    if (existingItem) {
      keep.push(existingItem);
    } else {
      create.push(value);
    }
  }

  const keepIds = new Set(keep.map((item) => item.id));

  const remove = existingItems.filter((item) => !keepIds.has(item.id));

  return {
    keep,
    create,
    remove,
  };
};

/* ============================================================
 * COMPENSATION
 * ============================================================ */

const createRelation = async (reportId, type, value) => {
  const config = RELATION_CONFIG[type];

  if (!config || typeof config.create !== "function") {
    throw new Error(`Relation "${type}" tidak dapat dibuat.`);
  }

  const payload =
    type === "material"
      ? {
          material: value,
        }
      : {
          activity: value,
        };

  const created = await config.create(reportId, payload);

  return {
    entity: created,
    id: config.getId(created),
  };
};

const removeRelation = async (reportId, type, id) => {
  const config = RELATION_CONFIG[type];

  if (!config || typeof config.remove !== "function") {
    throw new Error(`Relation "${type}" tidak dapat dihapus.`);
  }

  await config.remove(reportId, id);
};

const rollbackCreatedRelations = async ({ reportId, type, createdIds }) => {
  const rollbackFailed = [];

  if (!Array.isArray(createdIds) || createdIds.length === 0) {
    return rollbackFailed;
  }

  const results = await Promise.allSettled(
    createdIds.map((id) => removeRelation(reportId, type, id)),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      rollbackFailed.push(createdIds[index]);
    }
  });

  return rollbackFailed;
};

const restoreDeletedRelations = async ({ reportId, type, deletedItems }) => {
  const restored = [];

  const restoreFailed = [];

  if (!Array.isArray(deletedItems) || deletedItems.length === 0) {
    return {
      restored,
      restoreFailed,
    };
  }

  /*
   * Backend tidak menyediakan restore-by-id.
   *
   * Compensation dilakukan dengan recreate value.
   * ID lama tidak dapat dijamin tetap sama.
   */
  for (const item of deletedItems) {
    try {
      const value = normalizeText(
        item?.value ?? RELATION_CONFIG[type]?.getValue(item),
      );

      if (!value) {
        restoreFailed.push(item.id);

        continue;
      }

      const result = await createRelation(reportId, type, value);

      restored.push({
        previousId: item.id,

        newId: result.id,

        value,
      });
    } catch {
      restoreFailed.push(item.id);
    }
  }

  return {
    restored,
    restoreFailed,
  };
};

/* ============================================================
 * SYNC RELATION
 * ============================================================ */

const syncRelation = async ({
  reportId,
  existing = [],
  desired = [],
  type,
}) => {
  const normalizedReportId = normalizeId(reportId);

  if (normalizedReportId === null) {
    throw new Error("Report ID wajib diisi.");
  }

  const config = RELATION_CONFIG[type];

  if (!config) {
    throw new Error(`Relation "${type}" tidak didukung.`);
  }

  const plan = buildRelationPlan({
    existing,
    desired,
    type,
  });

  if (plan.create.length === 0 && plan.remove.length === 0) {
    return {
      created: [],

      deleted: [],

      restored: [],

      kept: plan.keep.map((item) => item.id),

      changed: false,
    };
  }

  const createdIds = [];

  const deletedIds = [];

  const deletedItems = [];

  try {
    /*
     * ========================================================
     * CREATE FIRST
     * ========================================================
     *
     * Create semua desired relation baru sebelum
     * menghapus relation lama.
     *
     * Jika CREATE gagal, existing state belum tersentuh.
     */
    for (const value of plan.create) {
      const result = await createRelation(normalizedReportId, type, value);

      if (result.id !== null) {
        createdIds.push(result.id);
      }
    }

    /*
     * ========================================================
     * DELETE OLD
     * ========================================================
     */
    for (const item of plan.remove) {
      await removeRelation(normalizedReportId, type, item.id);

      deletedIds.push(item.id);

      deletedItems.push(item);
    }

    return {
      created: createdIds,

      deleted: deletedIds,

      restored: [],

      kept: plan.keep.map((item) => item.id),

      changed: true,
    };
  } catch (error) {
    /*
     * ========================================================
     * COMPENSATION
     * ========================================================
     */

    const rollbackFailed = await rollbackCreatedRelations({
      reportId: normalizedReportId,

      type,

      createdIds,
    });

    const { restored, restoreFailed } = await restoreDeletedRelations({
      reportId: normalizedReportId,

      type,

      deletedItems,
    });

    const allRollbackFailed = [...rollbackFailed, ...restoreFailed];

    throw createReportSyncError(`Gagal menyinkronkan ${type}.`, {
      cause: error,

      created: createdIds,

      deleted: deletedIds,

      restored,

      operation: type,

      partial: createdIds.length > 0 || deletedIds.length > 0,

      rollbackFailed: allRollbackFailed,
    });
  } finally {
    /*
     * State backend mungkin sudah berubah walaupun
     * operation gagal. Cache lama tidak boleh dipercaya.
     */
    invalidateReportRelationCaches(normalizedReportId);
  }
};

/* ============================================================
 * MATERIAL
 * ============================================================ */

export const syncMaterials = async ({
  reportId,
  existing = [],
  desired = [],
}) => {
  return syncRelation({
    reportId,

    existing,

    desired,

    type: "material",
  });
};

/* ============================================================
 * ACTIVITY
 * ============================================================ */

export const syncActivities = async ({
  reportId,
  existing = [],
  desired = [],
}) => {
  return syncRelation({
    reportId,

    existing,

    desired,

    type: "activity",
  });
};

/* ============================================================
 * RELATION GROUP
 * ============================================================ */

export const syncReportRelations = async ({
  reportId,
  materials = [],
  activities = [],
  existingMaterials = [],
  existingActivities = [],
}) => {
  const normalizedReportId = normalizeId(reportId);

  if (normalizedReportId === null) {
    throw new Error("Report ID wajib diisi.");
  }

  try {
    /*
     * Serialisasi dilakukan di level group.
     *
     * Material dan activity sama-sama merupakan bagian
     * dari satu logical report mutation.
     *
     * Kita tidak menjalankannya dengan Promise.all lagi,
     * sehingga failure pertama tidak meninggalkan operasi
     * kedua yang masih berjalan di background.
     */
    const materialResult = await syncMaterials({
      reportId: normalizedReportId,

      existing: existingMaterials,

      desired: materials,
    });

    const activityResult = await syncActivities({
      reportId: normalizedReportId,

      existing: existingActivities,

      desired: activities,
    });

    invalidateReportRelationCaches(normalizedReportId);

    return {
      materials: materialResult,

      activities: activityResult,

      changed: Boolean(materialResult.changed || activityResult.changed),
    };
  } catch (error) {
    invalidateReportRelationCaches(normalizedReportId);

    throw error;
  }
};

/* ============================================================
 * PHOTO HELPERS
 * ============================================================ */

const getFileIdentity = (file) => {
  if (!file) {
    return "";
  }

  return [file.name ?? "", file.size ?? 0, file.lastModified ?? 0].join(":");
};

const dedupeFiles = (files) => {
  const normalized = normalizeImageFiles(files);

  const seen = new Set();

  return normalized.filter((file) => {
    const key = getFileIdentity(file);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
};

/* ============================================================
 * PHOTO UPLOAD
 * ============================================================ */

export const uploadPhotos = async ({
  reportId,
  files = [],
  startOrder = 0,
}) => {
  const normalizedReportId = normalizeId(reportId);

  if (normalizedReportId === null) {
    throw new Error("Report ID wajib diisi.");
  }

  const uniqueFiles = dedupeFiles(files);

  if (uniqueFiles.length === 0) {
    return [];
  }

  const uploaded = [];

  try {
    /*
     * Intentionally sequential.
     *
     * sort_order harus deterministik dan setiap upload
     * harus diketahui hasilnya sebelum lanjut.
     */
    for (let index = 0; index < uniqueFiles.length; index += 1) {
      const file = uniqueFiles[index];

      const encoded = await fileToBase64(file, {
        maxWidth: 1600,

        maxHeight: 1600,

        quality: 0.82,
      });

      const created = await reportPhotoService.createPhoto(normalizedReportId, {
        photo: encoded,

        sort_order: Number(startOrder) + index,
      });

      uploaded.push(created);
    }

    return uploaded;
  } catch (error) {
    const uploadedIds = uploaded.map(getPhotoId).filter((id) => id !== null);

    const rollbackResults = await Promise.allSettled(
      uploadedIds.map((id) =>
        reportPhotoService.removePhoto(normalizedReportId, id),
      ),
    );

    const rollbackFailed = uploadedIds.filter(
      (_, index) => rollbackResults[index]?.status === "rejected",
    );

    throw createReportSyncError("Gagal mengunggah foto laporan.", {
      cause: error,

      created: uploadedIds,

      operation: "photo-upload",

      partial: uploaded.length > 0,

      rollbackFailed,
    });
  }
};

/* ============================================================
 * REMOVE PHOTO
 * ============================================================ */

export const removePhotos = async ({ reportId, photoIds = [] }) => {
  const normalizedReportId = normalizeId(reportId);

  if (normalizedReportId === null) {
    throw new Error("Report ID wajib diisi.");
  }

  const ids = Array.from(
    new Set(
      (Array.isArray(photoIds) ? photoIds : [])
        .map(normalizeId)
        .filter((id) => id !== null),
    ),
  );

  if (ids.length === 0) {
    return [];
  }

  const deleted = [];

  try {
    for (const id of ids) {
      await reportPhotoService.removePhoto(normalizedReportId, id);

      deleted.push(id);
    }

    return deleted;
  } catch (error) {
    throw createReportSyncError("Gagal menghapus foto laporan.", {
      cause: error,

      deleted,

      operation: "photo-delete",

      partial: deleted.length > 0,
    });
  }
};

/* ============================================================
 * PHOTO GROUP
 * ============================================================ */

export const syncReportPhotos = async ({
  reportId,
  newPhotos = [],
  removedPhotoIds = [],
  existingPhotos = [],
}) => {
  const normalizedReportId = normalizeId(reportId);

  if (normalizedReportId === null) {
    throw new Error("Report ID wajib diisi.");
  }

  try {
    /*
     * Upload new files FIRST.
     *
     * Existing photos remain untouched until
     * all uploads are successful.
     */
    const uploaded = await uploadPhotos({
      reportId: normalizedReportId,

      files: newPhotos,

      startOrder: getNextPhotoSortOrder(existingPhotos),
    });

    try {
      /*
       * Delete old photos SECOND.
       */
      const deleted = await removePhotos({
        reportId: normalizedReportId,

        photoIds: removedPhotoIds,
      });

      invalidateReportRelationCaches(normalizedReportId);

      return {
        uploaded,

        deleted,

        changed: uploaded.length > 0 || deleted.length > 0,

        partial: false,

        rollbackFailed: [],
      };
    } catch (error) {
      /*
       * Delete gagal setelah sebagian/seluruh upload baru
       * berhasil.
       *
       * New uploads dibatalkan.
       *
       * Existing deleted photos TIDAK dipalsukan sebagai
       * restored karena backend tidak menyediakan restore
       * endpoint dan kita tidak memiliki canonical binary
       * payload yang aman untuk recreate.
       */
      const uploadedIds = uploaded.map(getPhotoId).filter((id) => id !== null);

      const rollbackResults = await Promise.allSettled(
        uploadedIds.map((id) =>
          reportPhotoService.removePhoto(normalizedReportId, id),
        ),
      );

      const rollbackFailed = uploadedIds.filter(
        (_, index) => rollbackResults[index]?.status === "rejected",
      );

      throw createReportSyncError("Gagal menghapus foto lama laporan.", {
        cause: error,

        created: uploadedIds,

        operation: "photo-sync",

        partial: uploaded.length > 0,

        rollbackFailed,
      });
    }
  } catch (error) {
    invalidateReportRelationCaches(normalizedReportId);

    throw error;
  }
};

export default {
  createReportSyncError,

  syncMaterials,

  syncActivities,

  syncReportRelations,

  uploadPhotos,

  removePhotos,

  syncReportPhotos,
};
