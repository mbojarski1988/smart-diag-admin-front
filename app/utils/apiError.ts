interface ApiErrorResponse {
  error?: string
  message?: string
}

interface ApiErrorLike {
  response?: {
    data?: ApiErrorResponse
  }
}

const messages: Record<string, string> = {
  forbidden: 'Nie masz uprawnień do wykonania tej operacji.',
  invalid_active: 'Nieprawidłowy status aktywności.',
  invalid_clientEmail: 'Podaj poprawny e-mail klienta.',
  invalid_json: 'Nieprawidłowe dane żądania.',
  invalid_pid: 'PID może zawierać tylko litery, cyfry oraz znaki . _ : -.',
  invalid_validUntil: 'Podaj poprawną datę ważności.',
  known_pid_already_exists: 'Ten PID już istnieje dla wybranego modelu.',
  known_pid_not_found: 'Nie znaleziono PID-u.',
  license_not_found: 'Nie znaleziono licencji.',
  missing_active: 'Brakuje statusu aktywności.',
  missing_clientEmail: 'Podaj e-mail klienta.',
  missing_clientName: 'Podaj nazwę klienta.',
  missing_model: 'Podaj model auta.',
  missing_name: 'Podaj nazwę.',
  missing_pid: 'Podaj PID.',
  missing_validUntil: 'Podaj datę ważności.',
  password_too_short: 'Hasło musi mieć minimum 8 znaków.',
  unauthorized: 'Sesja wygasła. Zaloguj się ponownie.',
  user_not_found: 'Nie znaleziono użytkownika.',
}

export function getApiErrorMessage(error: unknown, fallback = 'Wystąpił błąd. Spróbuj ponownie.') {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return fallback
  }

  const data = (error as ApiErrorLike).response?.data
  if (typeof data?.error !== 'string') {
    return typeof data?.message === 'string' ? data.message : fallback
  }

  return messages[data.error] ?? data.error
}
