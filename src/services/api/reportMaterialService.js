import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

class ReportMaterialService extends BaseService {
  constructor() {
    super(API_ROUTES.reports);
  }

  getAllMaterials(reportId, options = {}) {
    return this.request(this._materialCollectionPath(reportId), {
      method: "GET",
      ...options,
    });
  }

  getMaterialById(reportId, materialId, options = {}) {
    return this.request(
      `${this._materialCollectionPath(reportId)}/${this._encodeId(materialId)}`,
      {
        method: "GET",
        ...options,
      },
    );
  }

  createMaterial(reportId, payload, options = {}) {
    return this.request(this._materialCollectionPath(reportId), {
      method: "POST",
      body: payload,
      ...options,
    });
  }

  updateMaterial(reportId, materialId, payload, options = {}) {
    return this.request(
      `${this._materialCollectionPath(reportId)}/${this._encodeId(materialId)}`,
      {
        method: "PUT",
        body: payload,
        ...options,
      },
    );
  }

  removeMaterial(reportId, materialId, options = {}) {
    return this.request(
      `${this._materialCollectionPath(reportId)}/${this._encodeId(materialId)}`,
      {
        method: "DELETE",
        ...options,
      },
    );
  }

  _materialCollectionPath(reportId) {
    if (reportId === null || reportId === undefined || reportId === "") {
      throw new Error("Report ID wajib diisi.");
    }

    const fullPath = API_ROUTES.reportMaterials(reportId);

    const basePath = API_ROUTES.reports;

    return fullPath.startsWith(basePath)
      ? fullPath.slice(basePath.length)
      : fullPath;
  }

  _encodeId(id) {
    if (id === null || id === undefined || id === "") {
      throw new Error("Material ID wajib diisi.");
    }

    return encodeURIComponent(String(id));
  }
}

export const reportMaterialService = new ReportMaterialService();

export default reportMaterialService;
