import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

class ReportActivityService extends BaseService {
  constructor() {
    super(API_ROUTES.reports);
  }

  getAllActivities(reportId) {
    return this.request(this._activityCollectionPath(reportId), {
      method: "GET",
    });
  }

  getActivityById(reportId, activityId) {
    return this.request(
      `${this._activityCollectionPath(reportId)}/${this._encodeId(activityId)}`,
      {
        method: "GET",
      },
    );
  }

  createActivity(reportId, payload) {
    return this.request(this._activityCollectionPath(reportId), {
      method: "POST",
      body: payload,
    });
  }

  updateActivity(reportId, activityId, payload) {
    return this.request(
      `${this._activityCollectionPath(reportId)}/${this._encodeId(activityId)}`,
      {
        method: "PUT",
        body: payload,
      },
    );
  }

  removeActivity(reportId, activityId) {
    return this.request(
      `${this._activityCollectionPath(reportId)}/${this._encodeId(activityId)}`,
      {
        method: "DELETE",
      },
    );
  }

  _activityCollectionPath(reportId) {
    const fullPath = API_ROUTES.reportActivities(reportId);

    const basePath = API_ROUTES.reports;

    return fullPath.startsWith(basePath)
      ? fullPath.slice(basePath.length)
      : fullPath;
  }

  _encodeId(id) {
    return encodeURIComponent(id);
  }
}

export const reportActivityService = new ReportActivityService();

export default reportActivityService;
