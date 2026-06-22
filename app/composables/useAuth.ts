import type { AuthUser } from '~/types'

export const useAuth = () => {
  const token = useCookie<string | null>('jwt')
  const user = useState<AuthUser | null>('auth.user', () => null)
  const { $api } = useNuxtApp() as { $api: ReturnType<typeof import('axios').default.create> }

  const isLoggedIn = computed(() => !!token.value)

  async function login(email: string, password: string) {
    const { data } = await $api.post<{ token: string; user: AuthUser }>('/api/auth/login', { email, password })
    token.value = data.token
    user.value = data.user
  }

  async function fetchMe() {
    const { data } = await $api.get<AuthUser>('/api/auth/me')
    user.value = data
  }

  function logout() {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  return { user, token, isLoggedIn, login, fetchMe, logout }
}
