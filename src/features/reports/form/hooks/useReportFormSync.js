import {
  reportActivityService,
  reportMaterialService,
  reportPhotoService,
} from "@/services/api";

import {
  fileToBase64,
  getNextPhotoSortOrder,
  getPhotoId,
  normalizeExistingRelations,
  normalizeId,
  normalizeImageFiles,
  normalizeRelationComparisonValue,
} from "../utils/reportFormUtils";

/* ============================================================
 * CONFIG
 * ============================================================ */

const RELATION_CONFIG = {
  material: {
    fallbackIdFields: ["material_id", "report_material_id"],

    remove: (reportId, relationId) =>
      reportMaterialService.removeMaterial(reportId, relationId),

    create: (reportId, value) =>
      reportMaterialService.createMaterial(reportId, {
        material: value,
      }),

    getId: (item) =>
      normalizeId(item?.id ?? item?.material_id ?? item?.report_material_id),

    getValue: (item) => item?.value ?? item?.material ?? item?.name ?? "",
  },

  activity: {
    fallbackIdFields: ["activity_id", "report_activity_id"],

    remove: (reportId, relationId) =>
      reportActivityService.removeActivity(reportId, relationId),

    create: (reportId, value) =>
      reportActivityService.createActivity(reportId, {
        activity: value,
      }),

    getId: (item) =>
      normalizeId(item?.id ?? item?.activity_id ?? item?.report_activity_id),

    getValue: (item) => item?.value ?? item?.activity ?? item?.name ?? "",
  },
};

/* ============================================================
 * HELPERS
 * ============================================================ */

const getUniqueDesiredValues = (values) => {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();

  const unique = [];

  for (const value of values) {
    const normalized = normalizeRelationComparisonValue(value);

    if (!normalized) {
      continue;
    }

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);

    unique.push(value);
  }

  return unique;
};

const createExistingMap = (existingItems) => {
  const map = new Map();

  for (const item of existingItems) {
    const normalizedValue = normalizeRelationComparisonValue(item.value);

    if (!normalizedValue || item.id === null) {
      continue;
    }

    /*
     * Jika duplicate value memang sudah ada
     * di database, pertahankan item pertama
     * agar kita tidak menghapus semua duplicate
     * tanpa alasan.
     */
    if (!map.has(normalizedValue)) {
      map.set(normalizedValue, item);
    }
  }

  return map;
};

const rollbackCreatedRelations = async ({ reportId, ids, config }) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return;
  }

  await Promise.allSettled(ids.map((id) => config.remove(reportId, id)));
};

const restoreDeletedRelations = async ({ reportId, items, config }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return;
  }

  /*
   * Sequential restore:
   * lebih deterministic ketika
   * service/backend memiliki ordering.
   */
  for (const item of items) {
    await config.create(reportId, config.getValue(item));
  }
};

/* ============================================================
 * RELATION SYNC
 * ============================================================ */

const syncRelation = async ({ reportId, existing, desired, type }) => {
  const config = RELATION_CONFIG[type];

  if (!config) {
    throw new Error(`Relation type "${type}" tidak didukung.`);
  }

  const normalizedReportId = normalizeId(reportId);

  if (normalizedReportId === null) {
    throw new Error("Report ID wajib diisi.");
  }

  const existingItems = normalizeExistingRelations(
    existing,
    type,
    config.fallbackIdFields,
  );

  const desiredValues = getUniqueDesiredValues(desired);

  /*
   * Existing relation lookup:
   *
   * value -> relation
   *
   * O(1) average lookup.
   */
  const existingMap = createExistingMap(existingItems);

  const matchedIds = new Set();

  const valuesToCreate = [];

  for (const desiredValue of desiredValues) {
    const normalizedDesired = normalizeRelationComparisonValue(desiredValue);

    const match = existingMap.get(normalizedDesired);

    if (match) {
      matchedIds.add(match.id);

      continue;
    }

    valuesToCreate.push(desiredValue);
  }

  const itemsToDelete = existingItems.filter(
    (item) => !matchedIds.has(item.id),
  );

  /*
   * Tidak ada perubahan sama sekali.
   * Hindari network request.
   */
  if (valuesToCreate.length === 0 && itemsToDelete.length === 0) {
    return {
      created: [],
      deleted: [],
    };
  }

  const createdIds = [];

  /* ========================================================
   * CREATE FIRST
   * ======================================================== */

  try {
    /*
     * Sequential create dipertahankan
     * karena rollback membutuhkan ID
     * yang baru saja dibuat.
     */
    for (const value of valuesToCreate) {
      const created = await config.create(normalizedReportId, value);

      const createdId = config.getId(created);

      if (createdId !== null) {
        createdIds.push(createdId);
      }
    }
  } catch (error) {
    await rollbackCreatedRelations({
      reportId: normalizedReportId,

      ids: createdIds,

      config,
    });

    throw error;
  }

  /* ========================================================
   * DELETE OLD
   * ======================================================== */

  const deletedItems = [];

  try {
    for (const item of itemsToDelete) {
      await config.remove(normalizedReportId, item.id);

      deletedItems.push(item);
    }
  } catch (error) {
    await Promise.allSettled([
      rollbackCreatedRelations({
        reportId: normalizedReportId,

        ids: createdIds,

        config,
      }),

      restoreDeletedRelations({
        reportId: normalizedReportId,

        items: deletedItems,

        config,
      }),
    ]);

    throw error;
  }

  return {
    created: createdIds,
    deleted: deletedItems.map((item) => item.id),
  };
};

/* ============================================================
 * MATERIALS
 * ============================================================ */

export const syncMaterials = async ({ reportId, existing, desired }) => {
  return syncRelation({
    reportId,
    existing,
    desired,
    type: "material",
  });
};

/* ============================================================
 * ACTIVITIES
 * ============================================================ */

export const syncActivities = async ({ reportId, existing, desired }) => {
  return syncRelation({
    reportId,
    existing,
    desired,
    type: "activity",
  });
};

/* ============================================================
 * PHOTO UPLOAD
 * ============================================================ */

export const uploadPhotos = async ({ reportId, files, startOrder = 0 }) => {
  const normalizedReportId = normalizeId(reportId);

  if (normalizedReportId === null) {
    throw new Error("Report ID wajib diisi.");
  }

  const normalizedFiles = normalizeImageFiles(files);

  if (normalizedFiles.length === 0) {
    return [];
  }

  const uploaded = [];

  try {
    /*
     * Sequential processing sengaja:
     * - menjaga memory usage
     * - menjaga sort_order deterministik
     * - mempermudah rollback
     */
    for (let index = 0; index < normalizedFiles.length; index += 1) {
      const file = normalizedFiles[index];

      const base64 = await fileToBase64(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      });

      const photo = await reportPhotoService.createPhoto(normalizedReportId, {
        photo: base64,
        sort_order: startOrder + index,
      });

      uploaded.push(photo);
    }

    return uploaded;
  } catch (error) {
    const uploadedIds = uploaded.map(getPhotoId).filter((id) => id !== null);

    await Promise.allSettled(
      uploadedIds.map((id) =>
        reportPhotoService.removePhoto(normalizedReportId, id),
      ),
    );

    throw error;
  }
};

/* ============================================================
 * PHOTO DELETE
 * ============================================================ */

export const removePhotos = async ({ reportId, photoIds }) => {
  const normalizedReportId = normalizeId(reportId);

  if (normalizedReportId === null) {
    throw new Error("Report ID wajib diisi.");
  }

  if (!Array.isArray(photoIds) || photoIds.length === 0) {
    return [];
  }

  const ids = Array.from(
    new Set(photoIds.map(normalizeId).filter((id) => id !== null)),
  );

  if (ids.length === 0) {
    return [];
  }

  const deletedIds = [];

  for (const photoId of ids) {
    await reportPhotoService.removePhoto(normalizedReportId, photoId);

    deletedIds.push(photoId);
  }

  return deletedIds;
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
  const [materialResult, activityResult] = await Promise.all([
    syncMaterials({
      reportId,
      existing: existingMaterials,
      desired: materials,
    }),

    syncActivities({
      reportId,
      existing: existingActivities,
      desired: activities,
    }),
  ]);

  return {
    materials: materialResult,

    activities: activityResult,
  };
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

  const uploaded = await uploadPhotos({
    reportId: normalizedReportId,

    files: newPhotos,

    startOrder: getNextPhotoSortOrder(existingPhotos),
  });

  try {
    await removePhotos({
      reportId: normalizedReportId,

      photoIds: removedPhotoIds,
    });
  } catch (error) {
    const uploadedIds = uploaded.map(getPhotoId).filter((id) => id !== null);

    await Promise.allSettled(
      uploadedIds.map((id) =>
        reportPhotoService.removePhoto(normalizedReportId, id),
      ),
    );

    throw error;
  }

  return uploaded;
};
