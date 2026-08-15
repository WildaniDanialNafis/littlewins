import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

export const classService = new BaseService(API_ROUTES.classes);

export default classService;
