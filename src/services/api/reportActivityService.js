import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

class ReportActivityService extends BaseService {
  constructor() {
    super(API_ROUTES.reports);
  }

  getAllActivities(reportId, options = {}) {
    return this.request(this._activityCollectionPath(reportId), {
      method: "GET",
      ...options,
    });
  }

  getActivityById(reportId, activityId, options = {}) {
    return this.request(
      `${this._activityCollectionPath(reportId)}/${this._encodeId(activityId)}`,
      {
        method: "GET",
        ...options,
      },
    );
  }

  createActivity(reportId, payload, options = {}) {
    return this.request(this._activityCollectionPath(reportId), {
      method: "POST",
      body: payload,
      ...options,
    });
  }

  updateActivity(reportId, activityId, payload, options = {}) {
    return this.request(
      `${this._activityCollectionPath(reportId)}/${this._encodeId(activityId)}`,
      {
        method: "PUT",
        body: payload,
        ...options,
      },
    );
  }

  removeActivity(reportId, activityId, options = {}) {
    return this.request(
      `${this._activityCollectionPath(reportId)}/${this._encodeId(activityId)}`,
      {
        method: "DELETE",
        ...options,
      },
    );
  }

  _activityCollectionPath(reportId) {
    if (reportId === null || reportId === undefined || reportId === "") {
      throw new Error("Report ID wajib diisi.");
    }

    const fullPath = API_ROUTES.reportActivities(reportId);

    const basePath = API_ROUTES.reports;

    return fullPath.startsWith(basePath)
      ? fullPath.slice(basePath.length)
      : fullPath;
  }

  _encodeId(id) {
    if (id === null || id === undefined || id === "") {
      throw new Error("Activity ID wajib diisi.");
    }

    return encodeURIComponent(String(id));
  }
}

export const reportActivityService = new ReportActivityService();

export default reportActivityService;
