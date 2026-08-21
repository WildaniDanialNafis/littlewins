import { getResourceKey, invalidateResource } from "@/shared/cache";

import { STORAGE_KEYS } from "@/shared/constants";

/* ============================================================
 * HELPERS
 * ============================================================ */

const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).trim();

  return normalized || null;
};

const getCurrentUserScope = () => {
  try {
    if (typeof localStorage === "undefined") {
      return null;
    }

    const rawUser = localStorage.getItem(STORAGE_KEYS.user);

    if (!rawUser) {
      return null;
    }

    const user = JSON.parse(rawUser);

    const userId = user?.profile?.id ?? user?.id;

    if (userId === null || userId === undefined || userId === "") {
      return null;
    }

    const role = String(user?.role ?? "unknown")
      .trim()
      .toLowerCase();

    return `${role}:${String(userId)}`;
  } catch {
    return null;
  }
};

const createUserResourceKey = (resource) => {
  const userScope = getCurrentUserScope();

  if (!userScope) {
    return null;
  }

  return getResourceKey({
    scope: `user:${userScope}`,
    resource,
  });
};

/* ============================================================
 * LIST
 * ============================================================ */

export const invalidateReportListCache = () => {
  const key = createUserResourceKey("reports:list");

  if (!key) {
    return null;
  }

  return invalidateResource(key);
};

/* ============================================================
 * DETAIL
 * ============================================================ */

export const getReportDetailCacheKey = (reportId) => {
  const normalizedId = normalizeId(reportId);

  if (normalizedId === null) {
    return null;
  }

  const userScope = getCurrentUserScope();

  if (!userScope) {
    return null;
  }

  return getResourceKey({
    scope: `user:${userScope}`,
    resource: `reports:${String(normalizedId)}`,
  });
};

export const invalidateReportDetailCache = (reportId) => {
  const key = getReportDetailCacheKey(reportId);

  if (!key) {
    return null;
  }

  return invalidateResource(key);
};

/* ============================================================
 * RELATIONS
 * ============================================================ */

export const getReportRelationCacheKey = (reportId, resourceName) => {
  const normalizedId = normalizeId(reportId);

  if (normalizedId === null || !resourceName) {
    return null;
  }

  const userScope = getCurrentUserScope();

  if (!userScope) {
    return null;
  }

  return getResourceKey({
    scope: `user:${userScope}`,
    resource: `report:${String(normalizedId)}:${String(resourceName)}`,
  });
};

export const invalidateReportRelationCache = (reportId, resourceName) => {
  const key = getReportRelationCacheKey(reportId, resourceName);

  if (!key) {
    return null;
  }

  return invalidateResource(key);
};

/* ============================================================
 * ALL REPORT CACHES
 * ============================================================ */

export const invalidateReportCaches = (
  reportId,
  { relations = true, list = true, detail = true } = {},
) => {
  const normalizedId = normalizeId(reportId);

  const results = {
    list: null,
    detail: null,
    relations: [],
  };

  if (list) {
    results.list = invalidateReportListCache();
  }

  if (detail && normalizedId !== null) {
    results.detail = invalidateReportDetailCache(normalizedId);
  }

  if (relations && normalizedId !== null) {
    const relationNames = ["materials", "activities", "photos", "relation"];

    for (const name of relationNames) {
      const result = invalidateReportRelationCache(normalizedId, name);

      if (result !== null) {
        results.relations.push(result);
      }
    }
  }

  return results;
};

/* ============================================================
 * BATCH HELPERS
 * ============================================================ */

export const invalidateAfterReportCreate = () => {
  return invalidateReportCaches(null, {
    relations: false,
    detail: false,
    list: true,
  });
};

export const invalidateAfterReportMutation = (reportId) => {
  return invalidateReportCaches(reportId, {
    relations: true,
    detail: true,
    list: true,
  });
};

export default {
  getReportDetailCacheKey,
  getReportRelationCacheKey,

  invalidateReportListCache,
  invalidateReportDetailCache,
  invalidateReportRelationCache,
  invalidateReportCaches,

  invalidateAfterReportCreate,
  invalidateAfterReportMutation,
};
