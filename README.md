# SmartDiagTool Front

Panel administracyjny SmartDiagTool zbudowany w Nuxt 3. Aplikacja udostępnia logowanie administratora oraz widoki do zarządzania:

- licencjami,
- użytkownikami,
- znanymi PID-ami,
- promptami AI.

## Technologie

- Nuxt 3
- Vue 3
- TypeScript
- Nuxt UI
- Axios
- Docker / Docker Compose

## Wymagania

- Node.js 22 i npm
- działające API backendu, domyślnie pod adresem `http://localhost:8000`

Alternatywnie można uruchomić projekt przez Docker Compose.

## Konfiguracja

Skopiuj plik przykładowy i ustaw wartości środowiskowe:

```sh
cp .env.example .env
```

Dostępne zmienne:

```env
NUXT_PUBLIC_API_URL=http://localhost:8000
```

`NUXT_PUBLIC_API_URL` wskazuje adres backendu używany przez proxy Nuxt dla żądań pod `/api`.

## Uruchomienie lokalne

Zainstaluj zależności:

```sh
npm ci
```

Uruchom aplikację deweloperską:

```sh
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`.

## Uruchomienie przez Docker Compose

Tryb produkcyjny:

```sh
make up
```

Tryb deweloperski:

```sh
make dev
```

Zatrzymanie kontenerów:

```sh
make down
```

Domyślne porty można zmienić przez zmienne:

- `FRONT_PORT` dla kontenera produkcyjnego,
- `FRONT_DEV_PORT` dla kontenera deweloperskiego.

## Przydatne komendy

```sh
npm run lint
npm run build
npm run preview
npm run generate
```

Odpowiedniki przez Docker Compose:

```sh
make install
make lint
make build
make shell
```

Po zbudowaniu aplikację serwerową można uruchomić także lokalnie:

```sh
node .output/server/index.mjs
```

## CI/CD

Workflow GitHub Actions znajduje się w `.github/workflows/ci.yml`.

Na pull requestach uruchamia:

- `npm ci`
- `npm run lint`
- `npm run build`
- testowy build obrazu Docker

Po pushu na `main` dodatkowo publikuje obraz Docker do GitHub Container Registry:

```text
ghcr.io/mbojarski1988/smart-diag-admin-front
```

## Struktura projektu

```text
app/
  assets/css/        Style globalne
  components/        Komponenty widoków
  composables/       Logika współdzielona, np. autoryzacja
  layouts/           Layout aplikacji
  middleware/        Middleware Nuxt, np. ochrona tras
  pages/             Strony aplikacji
  plugins/           Pluginy Nuxt, np. klient API
  types/             Typy TypeScript
```

## Routing

Najważniejsze widoki aplikacji:

- `/login` — logowanie administratora,
- `/licenses` — zarządzanie licencjami,
- `/users` — zarządzanie użytkownikami,
- `/known-pids` — zarządzanie znanymi PID-ami,
- `/ai-prompts` — zarządzanie promptami AI.

Ścieżka `/` przekierowuje zalogowanego użytkownika do widoku licencji.

## API i autoryzacja

Klient HTTP jest skonfigurowany w `app/plugins/axios.ts`. Token JWT jest przechowywany w cookie `jwt` i automatycznie dodawany do nagłówka `Authorization` dla kolejnych zapytań. Przy odpowiedzi `401` aplikacja czyści stan sesji i przekierowuje użytkownika z powrotem do `/login`.
