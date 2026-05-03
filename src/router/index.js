import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: "/", name: "home", component: () => import("../views/HomeView.vue") },
  { path: "/shop", name: "shop", component: () => import("../views/ShopView.vue") },
  { path: "/product/:id", component: () => import("../views/ProductView.vue") },
  { path: "/cart", component: () => import("../views/CartView.vue") },
  { path: "/about", name: "about", component: () => import("../views/AboutView.vue") },
  { path: "/:pathMatch(.*)*", redirect: "/" },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router