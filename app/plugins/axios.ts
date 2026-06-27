import axios from 'axios'

export default defineNuxtPlugin(() => {
  const token = useCookie<string | null>('jwt')
  const user = useState('auth.user', () => null)
  const config = useRuntimeConfig()

  const client = axios.create({
    baseURL: config.public.apiUrl as string,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use((cfg) => {
    if (token.value) cfg.headers.Authorization = `Bearer ${token.value}`
    return cfg
  })

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        token.value = null
        user.value = null
        navigateTo('/login')
      }
      return Promise.reject(err)
    },
  )

  return { provide: { api: client } }
})
