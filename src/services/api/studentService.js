import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

export const studentService = new BaseService(API_ROUTES.students);

export default studentService;
