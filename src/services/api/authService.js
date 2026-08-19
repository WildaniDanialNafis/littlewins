import { API_ROUTES } from "@/shared/constants";

import BaseService from "./baseService";

class AuthService extends BaseService {
  constructor() {
    super("");
  }

  login(username, password, options = {}) {
    return this.request(API_ROUTES.auth.login, {
      method: "POST",

      body: {
        username,
        password,
      },

      ...options,
    });
  }

  logout(options = {}) {
    return this.request(API_ROUTES.auth.logout, {
      method: "POST",
      ...options,
    });
  }

  me(options = {}) {
    return this.request(API_ROUTES.auth.me, {
      method: "GET",
      ...options,
    });
  }
}

export const authService = new AuthService();

export default authService;
