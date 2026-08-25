import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ProductsView from '@/views/ProductsView.vue'
import ClientsView from '@/views/ClientsView.vue'
import CalculatorView from '@/views/CalculatorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/', name: 'home', component: HomeView },
    { path: '/produtos', name: 'products', component: ProductsView },
    { path: '/clientes', name: 'clients', component: ClientsView },
    { path: '/calculadora', name: 'calculator', component: CalculatorView },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!auth.isRequired) return true

  if (to.meta.public) {
    if (auth.isAuthenticated && to.name === 'login') {
      return { name: 'home' }
    }
    return true
  }

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
