# Who's Drunk — Mobile (React Native + Expo)

> Frontend architecture, library stack and conventions. TypeScript end-to-end.
> The whole codebase is written in **English**; user-facing strings are funneled
> through a single place so we can add i18n later without touching logic.

---

## 1. Library stack (the choices)

| Concern | Library | Why |
|---------|---------|-----|
| **Navigation / routing** | **Expo Router** (file-based, built on React Navigation) | First-party for Expo, file-based routes, typed routes, native stack performance, deep-linking for free (invite links → join league later). Route *groups* `(auth)` / `(app)` let us model the protected vs public areas declaratively. |
| **Session / global state** | **Zustand** | Tiny, no boilerplate, usable **outside React** (the Axios interceptor reads tokens via `getState()`), and it survives re-renders cheaply. Ideal to hold the JWT session. |
| **Server state / data fetching** | **TanStack Query** (`@tanstack/react-query`) | Caching, retries, background refetch and request dedup for leagues/leaderboards. Keeps server data out of the global store. |
| **HTTP** | **Axios** + interceptors | Request interceptor injects the access token; response interceptor handles `401` with a single-flight **refresh-token** flow and retries the original request. |
| **Secure token storage** | **expo-secure-store** | Tokens live in the device Keychain/Keystore, never in `AsyncStorage`. |
| **Forms + validation** | **react-hook-form** + **zod** | Type-safe forms; the same zod schemas can mirror backend validation. |

Install with `npx expo install` so native versions match the Expo SDK (see `package.json`).

---

## 2. Folder architecture

```
mobile/
├── app/                          # Expo Router routes (file = screen)
│   ├── _layout.tsx               # Root: providers (QueryClient) + AUTH GATE
│   ├── index.tsx                 # Bootstrap → redirects based on session
│   ├── (auth)/                   # Public area (no token)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (app)/                    # Protected area (valid token required)
│       ├── _layout.tsx
│       └── index.tsx             # Leagues Dashboard (home)
│
├── src/
│   ├── config/
│   │   └── env.ts                # API base URL & runtime config
│   ├── api/
│   │   ├── client.ts             # Axios instance + JWT/refresh interceptors
│   │   └── endpoints/
│   │       ├── auth.ts           # register / login / refresh
│   │       └── leagues.ts        # leagues & seasons calls
│   ├── features/
│   │   └── auth/
│   │       ├── types.ts          # Session, AuthResponse, credentials
│   │       ├── secureStorage.ts  # expo-secure-store wrapper
│   │       ├── authStore.ts      # Zustand session store (source of truth)
│   │       └── useBootstrapAuth.ts
│   ├── components/               # Shared UI (Button, ScreenContainer, …)
│   └── theme/                    # Colors, spacing, typography
│
├── app.json                      # Expo app config
├── babel.config.js               # Expo Router plugin
├── tsconfig.json                 # Path alias @/* → src/*
└── package.json
```

### Layering rules
- **Routes (`app/`) stay thin**: they wire screens to hooks/stores; no business logic.
- **`features/`** owns domain logic and state. Auth is the first feature; `leagues`, `consumptions` follow the same shape.
- **`api/`** is the only place that knows about HTTP. Screens call typed endpoint functions or TanStack Query hooks, never Axios directly.
- **Token handling is centralized** in `authStore` + the Axios interceptors. Screens never touch tokens.

---

## 3. Authentication & navigation flow

```
App launch
   │
   ▼
app/index.tsx (Bootstrap)
   │  read tokens from SecureStore → authStore.bootstrap()
   │
   ├── status = "authenticated"   → redirect to /(app)        (Leagues Dashboard)
   └── status = "unauthenticated" → redirect to /(auth)/login (Login / Register)

Login/Register success
   │  POST /auth/login|register  → { accessToken, refreshToken, ... }
   │  persist tokens to SecureStore + set authStore session
   ▼
authStore.status = "authenticated"  → root gate redirects into /(app)

Any request → 401
   │  response interceptor → single-flight POST /auth/refresh (refreshToken)
   ├── success → store new tokens, retry original request
   └── failure → authStore.signOut() → gate redirects to /(auth)/login
```

The **gate** lives in `app/_layout.tsx`: it watches `authStore.status` and uses
Expo Router's `<Redirect>` / segment checks so the protected group is unreachable
without a valid session — even via deep links.

---

## 4. Backend contract (already implemented)

| Action | Endpoint |
|--------|----------|
| Register | `POST /api/v1/auth/register` |
| Login | `POST /api/v1/auth/login` |
| Refresh | `POST /api/v1/auth/refresh` |
| My leagues | `GET /api/v1/leagues` |
| Create league | `POST /api/v1/leagues` |
| Join by code | `POST /api/v1/leagues/join` |

`AuthResponse`: `{ userId, displayName, accessToken, refreshToken, tokenType, expiresInSeconds }`.
All protected endpoints expect `Authorization: Bearer <accessToken>`.

---

## 5. Run

```bash
cd mobile
npm install
# align native deps with the Expo SDK:
npx expo install
# point the app at your backend (defaults to http://localhost:8080):
echo "EXPO_PUBLIC_API_URL=http://10.0.2.2:8080" > .env   # Android emulator → host
npx expo start
```

> On Android emulator the host machine is `10.0.2.2`; on iOS simulator use `localhost`;
> on a physical device use your machine's LAN IP.
