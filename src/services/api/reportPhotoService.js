import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

class ReportPhotoService extends BaseService {
  constructor() {
    super(API_ROUTES.reports);
  }

  getAllPhotos(reportId) {
    return this.request(this._photoCollectionPath(reportId), {
      method: "GET",
    });
  }

  getPhotoById(reportId, photoId) {
    return this.request(
      `${this._photoCollectionPath(reportId)}/${this._encodeId(photoId)}`,
      {
        method: "GET",
      },
    );
  }

  createPhoto(reportId, payload) {
    return this.request(this._photoCollectionPath(reportId), {
      method: "POST",
      body: payload,
    });
  }

  updatePhoto(reportId, photoId, payload) {
    return this.request(
      `${this._photoCollectionPath(reportId)}/${this._encodeId(photoId)}`,
      {
        method: "PUT",
        body: payload,
      },
    );
  }

  removePhoto(reportId, photoId) {
    return this.request(
      `${this._photoCollectionPath(reportId)}/${this._encodeId(photoId)}`,
      {
        method: "DELETE",
      },
    );
  }

  _photoCollectionPath(reportId) {
    const fullPath = API_ROUTES.reportPhotos(reportId);

    const basePath = API_ROUTES.reports;

    return fullPath.startsWith(basePath)
      ? fullPath.slice(basePath.length)
      : fullPath;
  }

  _encodeId(id) {
    return encodeURIComponent(id);
  }
}

export const reportPhotoService = new ReportPhotoService();

export default reportPhotoService;
