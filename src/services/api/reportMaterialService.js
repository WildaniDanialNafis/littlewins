import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

class ReportMaterialService extends BaseService {
  constructor() {
    super(API_ROUTES.reports);
  }

  getAllMaterials(reportId) {
    return this.request(this._materialCollectionPath(reportId), {
      method: "GET",
    });
  }

  getMaterialById(reportId, materialId) {
    return this.request(
      `${this._materialCollectionPath(reportId)}/${this._encodeId(materialId)}`,
      {
        method: "GET",
      },
    );
  }

  createMaterial(reportId, payload) {
    return this.request(this._materialCollectionPath(reportId), {
      method: "POST",
      body: payload,
    });
  }

  updateMaterial(reportId, materialId, payload) {
    return this.request(
      `${this._materialCollectionPath(reportId)}/${this._encodeId(materialId)}`,
      {
        method: "PUT",
        body: payload,
      },
    );
  }

  removeMaterial(reportId, materialId) {
    return this.request(
      `${this._materialCollectionPath(reportId)}/${this._encodeId(materialId)}`,
      {
        method: "DELETE",
      },
    );
  }

  _materialCollectionPath(reportId) {
    const fullPath = API_ROUTES.reportMaterials(reportId);

    const basePath = API_ROUTES.reports;

    return fullPath.startsWith(basePath)
      ? fullPath.slice(basePath.length)
      : fullPath;
  }

  _encodeId(id) {
    return encodeURIComponent(id);
  }
}

export const reportMaterialService = new ReportMaterialService();

export default reportMaterialService;
