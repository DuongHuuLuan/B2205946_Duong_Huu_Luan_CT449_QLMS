import { createWebHistory, createRouter } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import Login from "@/views/auth/Login.vue";
import Register from "@/views/auth/Register.vue";

const DOCGIA_TOKEN_KEY = "docgiaToken";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { requiresAuth: true, title: "Trang chủ" },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "register",
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: "/sach",
    name: "sach.list",
    component: () => import("@/views/readers/ReaderHome.vue"),
    meta: { requiresAuth: true, role: "docgia", title: "Tất cả sách" },
  },
  {
    path: "/reader/books/:id",
    name: "reader.book-detail",
    component: () => import("@/views/readers/BookDetailView.vue"),
    meta: { requiresAuth: true, role: "docgia", title: "Chi tiết sách" },
  },
  {
    path: "/reader/checkout/:id",
    name: "reader.checkout-book",
    component: () => import("@/views/muonsach/MuonSachAdd.vue"),
    meta: { requiresAuth: true, role: "docgia", title: "Mượn sách" },
  },
  {
    path: "/reader/borrowed",
    name: "borrowed.list",
    component: () => import("@/views/muonsach/MuonSachList.vue"),
    meta: { requiresAuth: true, role: "docgia", title: "Danh Sách mượn" },
  },
  {
    path: "/docgia/profile",
    name: "docgia.profile",
    component: () => import("@/views/docgia/ProfileView.vue"),
    meta: { requiresAuth: true, role: "docgia", title: "Trang cá nhân" },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
  {
    path: "/reader/all-books",
    name: "reader.all-books",
    component: () => import("@/views/readers/AllBooksView.vue"),
  },
];

function isTokenPresent(raw) {
  return raw && raw !== "null" && raw !== "undefined" && raw !== "";
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const raw = localStorage.getItem(DOCGIA_TOKEN_KEY);
  const tokenPresent = isTokenPresent(raw);

  console.log(
    "[ROUTER GUARD] to:",
    to.name,
    "requiresAuth:",
    !!to.meta.requiresAuth,
    "tokenPresent:",
    tokenPresent
  );

  if (to.meta.requiresAuth && !tokenPresent) {
    localStorage.removeItem(DOCGIA_TOKEN_KEY);
    return next({ name: "login" });
  }

  if (tokenPresent && to.meta.requiresGuest) {
    return next({ name: "home" });
  }

  return next();
});

router.afterEach((to) => {
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title}`;
  } else {
    document.title = "Thư viện Online"; // fallback
  }
});

export default router;
