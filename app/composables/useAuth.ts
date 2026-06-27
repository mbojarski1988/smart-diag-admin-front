import type { AuthUser } from '~/types'

export const useAuth = () => {
  const token = useCookie<string | null>('jwt', {
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 8,
  })
  const user = useState<AuthUser | null>('auth.user', () => null)
  const $api = useApi()

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ROLE_ADMIN')

  async function login(email: string, password: string) {
    const { data } = await $api.post<{ token: string; user?: AuthUser }>('/api/auth/login', { email, password })
    token.value = data.token
    user.value = data.user ?? null

    if (!user.value) {
      await fetchMe()
    }
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

  function clearSession() {
    token.value = null
    user.value = null
  }

  return { user, token, isLoggedIn, isAdmin, login, fetchMe, logout, clearSession }
}
