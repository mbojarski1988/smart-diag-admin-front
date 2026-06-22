interface ApiErrorResponse {
  error?: string
}

interface ApiErrorLike {
  response?: {
    data?: ApiErrorResponse
  }
}

export function getApiErrorMessage(error: unknown, fallback = 'Wystąpił błąd. Spróbuj ponownie.') {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return fallback
  }

  const data = (error as ApiErrorLike).response?.data
  return typeof data?.error === 'string' ? data.error : fallback
}
