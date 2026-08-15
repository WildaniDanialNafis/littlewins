import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

export const reportService = new BaseService(API_ROUTES.reports);

export default reportService;
