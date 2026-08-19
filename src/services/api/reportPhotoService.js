import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

class ReportPhotoService extends BaseService {
  constructor() {
    super(API_ROUTES.reports);
  }

  getAllPhotos(reportId, options = {}) {
    return this.request(this._photoCollectionPath(reportId), {
      method: "GET",
      ...options,
    });
  }

  getPhotoById(reportId, photoId, options = {}) {
    return this.request(
      `${this._photoCollectionPath(reportId)}/${this._encodeId(photoId)}`,
      {
        method: "GET",
        ...options,
      },
    );
  }

  createPhoto(reportId, payload, options = {}) {
    return this.request(this._photoCollectionPath(reportId), {
      method: "POST",
      body: payload,
      ...options,
    });
  }

  updatePhoto(reportId, photoId, payload, options = {}) {
    return this.request(
      `${this._photoCollectionPath(reportId)}/${this._encodeId(photoId)}`,
      {
        method: "PUT",
        body: payload,
        ...options,
      },
    );
  }

  removePhoto(reportId, photoId, options = {}) {
    return this.request(
      `${this._photoCollectionPath(reportId)}/${this._encodeId(photoId)}`,
      {
        method: "DELETE",
        ...options,
      },
    );
  }

  _photoCollectionPath(reportId) {
    if (reportId === null || reportId === undefined || reportId === "") {
      throw new Error("Report ID wajib diisi.");
    }

    const fullPath = API_ROUTES.reportPhotos(reportId);

    const basePath = API_ROUTES.reports;

    return fullPath.startsWith(basePath)
      ? fullPath.slice(basePath.length)
      : fullPath;
  }

  _encodeId(id) {
    if (id === null || id === undefined || id === "") {
      throw new Error("Photo ID wajib diisi.");
    }

    return encodeURIComponent(String(id));
  }
}

export const reportPhotoService = new ReportPhotoService();

export default reportPhotoService;
