export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()
  const token = auth.token

  if (to.path !== '/login' && !token.value) return navigateTo('/login')
  if (!token.value) return

  try {
    if (!auth.user.value) {
      await auth.fetchMe()
    }
  } catch {
    auth.clearSession()
    if (to.path !== '/login') return navigateTo('/login')
    return
  }

  if (to.path === '/login') return navigateTo('/')
  if (!auth.isAdmin.value) {
    auth.clearSession()
    return navigateTo('/login')
  }
})
