import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

class AuthService extends BaseService {
  constructor() {
    super("");
  }

  login(username, password) {
    return this.request(API_ROUTES.auth.login, {
      method: "POST",
      body: {
        username,
        password,
      },
    });
  }

  logout() {
    return this.request(API_ROUTES.auth.logout, {
      method: "POST",
    });
  }

  me() {
    return this.request(API_ROUTES.auth.me, {
      method: "GET",
    });
  }
}

export const authService = new AuthService();

export default authService;
