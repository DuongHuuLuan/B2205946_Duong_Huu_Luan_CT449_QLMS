import createApiClient from "./api.service";

const API_BASE_URL = "http://localhost:3000/api/auth";

class AuthService {
  constructor(baseURL = API_BASE_URL) {
    this.api = createApiClient(baseURL);
  }

  async register(data) {
    return (await this.api.post("/register", data)).data;
  }

  async login(data) {
    return (await this.api.post("/login", data)).data;
  }

  logout() {
    localStorage.removeItem("userToken");
  }

  saveToken(token) {
    localStorage.setItem("userToken", token);
  }

  getToken() {
    return localStorage.getItem("userToken");
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}

export default new AuthService();
