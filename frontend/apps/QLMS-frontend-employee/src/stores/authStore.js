import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoggedIn: false,
    user: null,
    token: localStorage.getItem("token") || null,
  }),
  actions: {
    setUser(userData) {
      this.user = userData;
      this.isLoggedIn = true;
    },
    logout() {
      this.user = null;
      this.isLoggedIn = false;
      this.token = null;
      localStorage.removeItem("token");
    },
  },
  getters: {
    isAuthenticated: (state) => state.isLoggedIn,
    getMSNV: (state) => (state.user ? state.user.MSNV : null),
    isAdmin: (state) => state.user && state.user.ChucVu === "quanly",
    getUserName: (state) => (state.user ? state.user.HoTenNV : "Khách"),
  },
});
