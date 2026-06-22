# SmartDiagTool Front

Panel administracyjny SmartDiagTool zbudowany w Nuxt 3. Aplikacja obsluguje logowanie administratora oraz widoki do zarzadzania licencjami i uzytkownikami.

## Technologie

- Nuxt 3
- Vue 3
- TypeScript
- Nuxt UI
- Axios

## Wymagania

- Node.js 22 albo Docker z Docker Compose
- Dzialajace API backendu, domyslnie pod adresem `http://localhost:8000`

## Konfiguracja

Skopiuj plik przykladowy i ustaw wartosci srodowiskowe:

```sh
cp .env.example .env
```

Dostepne zmienne:

```env
NUXT_PUBLIC_API_URL=http://localhost:8000
NUXT_PUBLIC_ADMIN_KEY=change-me-admin-key
```

## Uruchomienie lokalne

Zainstaluj zaleznosci:

```sh
npm install
```

Uruchom aplikacje deweloperska:

```sh
npm run dev
```

Aplikacja bedzie dostepna pod adresem `http://localhost:3000`.

## Uruchomienie przez Docker Compose

Tryb produkcyjny:

```sh
make up
```

Tryb deweloperski:

```sh
make dev
```

Zatrzymanie kontenerow:

```sh
make down
```

## Przydatne komendy

```sh
npm run lint
npm run build
npm run preview
```

Odpowiedniki przez Docker Compose:

```sh
make lint
make build
make shell
```

## Struktura projektu

```text
app/
  assets/css/        Style globalne
  components/        Komponenty widokow
  composables/       Logika wspoldzielona, np. autoryzacja
  layouts/           Layout aplikacji
  middleware/        Middleware Nuxt, np. ochrona tras
  pages/             Strony aplikacji
  plugins/           Pluginy Nuxt, np. klient API
  types/             Typy TypeScript
```

## API

Klient HTTP jest skonfigurowany w `app/plugins/axios.ts`. Token JWT jest przechowywany w cookie `jwt` i automatycznie dodawany do naglowka `Authorization` dla kolejnych zapytan.
