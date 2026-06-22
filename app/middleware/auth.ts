export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('jwt')
  if (to.path !== '/login' && !token.value) return navigateTo('/login')
  if (to.path === '/login' && token.value) return navigateTo('/')
})
