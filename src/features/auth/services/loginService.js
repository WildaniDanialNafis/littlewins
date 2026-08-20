// src/features/auth/services/loginService.js

import { BaseService } from "@/services/api";

class LoginService extends BaseService {
  constructor() {
    super(""); // endpoint kosong, karena login di root
  }

  login(username, password) {
    return this.request("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  logout() {
    return this.request("/logout", {
      method: "POST",
    });
  }

  register(userData) {
    return this.request("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }
}

export const loginService = new LoginService();
