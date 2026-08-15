import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

export const programService = new BaseService(API_ROUTES.programs);

export default programService;
