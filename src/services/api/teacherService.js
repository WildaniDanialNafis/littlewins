import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

export const teacherService = new BaseService(API_ROUTES.teachers);

export default teacherService;
