# 🍻 Who's Drunk

A social, gamified mobile app where groups of friends compete in private **leagues** to see who drinks the most over a **season** (one calendar month by default). Log your drinks, climb the leaderboard, get notified the instant someone overtakes you (the "Sorpasso"), crown a monthly champion, and settle bar arguments with real stats.

> ⚠️ **Drink responsibly.** The app gamifies alcohol consumption and enforces an 18+ gate at sign-up. It is intended for entertainment among consenting adults.

---

## ✨ Features

- **Auth** — email/password with JWT (access + refresh), 18+ verification.
- **Leagues** — create private leagues with shareable invite codes; join by code (idempotent).
- **Seasons** — an inaugural season opens automatically on league creation; a scheduled job rolls every league into the new month on the 1st.
- **Drink logging** — search a real catalog (Open Food Facts) by name/barcode; pick format (caña, tercio, chupito…) and quantity.
- **Scoring engine** — pure-alcohol grams from volume × ABV × ethanol density, converted to points (pluggable strategy, SOLID).
- **Leaderboard** — live season ranking with a Top-3 podium and pull-to-refresh.
- **Push notifications** — "Sorpasso" alerts when you're overtaken, with deep-linking straight to that league's leaderboard.
- **Hall of Fame** — past seasons with their crowned champions.
- **League Insights** — star drink, signature drink per Top-3 player, and the "on fire" 🔥 streak.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native + **Expo** (SDK 51), TypeScript, Expo Router, Zustand, TanStack Query, Axios, expo-secure-store, expo-notifications |
| **Backend** | **Spring Boot 3.3 / Java 21**, Spring Security + JWT (jjwt), Spring Data JPA, Flyway, Resilience4j, springdoc OpenAPI |
| **Database** | **PostgreSQL 16** |
| **External APIs** | Open Food Facts (drink catalog + ABV), Expo Push API |

A deeper design write-up lives in [`ARQUITECTURA.md`](./ARQUITECTURA.md) (backend) and [`mobile/ARCHITECTURE.md`](./mobile/ARCHITECTURE.md) (frontend).

---

## 📁 Repository layout

```
Who's-Drunk/
├── ARQUITECTURA.md         # Backend architecture & data model
├── README.md               # ← you are here
├── backend/                # Spring Boot API + scoring engine
│   ├── src/main/java/com/whosdrunk/...
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/   # Flyway V1…V7
└── mobile/                 # Expo / React Native app
    ├── app/                # Expo Router routes
    └── src/                # features, api, components
```

---

## 🚀 Backend — getting started

### Prerequisites
- **JDK 21**
- **Maven 3.9+**
- **PostgreSQL 16** (local install or Docker)
- Docker (optional, easiest way to run Postgres)

### 1. Start PostgreSQL

The defaults expect a database named `whosdrunk` with user/password `whosdrunk`. With Docker:

```bash
docker run --name whosdrunk-db \
  -e POSTGRES_USER=whosdrunk \
  -e POSTGRES_PASSWORD=whosdrunk \
  -e POSTGRES_DB=whosdrunk \
  -p 5432:5432 -d postgres:16
```

> Flyway runs the migrations (`V1…V7`) automatically on startup and seeds serving formats, drink types and a few fallback drinks. You don't need to create any tables by hand.

### 2. Environment variables

Every variable has a **local fallback**, so the app boots with zero configuration for development. Override them in production.

| Variable | Required in prod? | Local fallback | Purpose |
|----------|-------------------|----------------|---------|
| `DB_URL` | recommended | `jdbc:postgresql://localhost:5432/whosdrunk` | JDBC connection string |
| `DB_USER` | recommended | `whosdrunk` | DB user |
| `DB_PASSWORD` | **yes** | `whosdrunk` | DB password |
| `JWT_SECRET` | **yes** | `dev-secret-change-me-…` (dev only) | JWT signing key — **must be ≥ 32 bytes** |
| `PORT` | no | `8080` | HTTP port |
| `JWT_ACCESS_TTL` | no | `30` | Access token lifetime (minutes) |
| `JWT_REFRESH_TTL` | no | `30` | Refresh token lifetime (days) |
| `SEASON_ROLLOVER_CRON` | no | `0 0 0 1 * *` | When the monthly rollover runs |
| `SEASON_ZONE` | no | `Europe/Madrid` | Timezone for season boundaries & streaks |
| `COCKTAILDB_KEY` | no | `1` (test key) | TheCocktailDB API key |

> 🔐 **Never ship the default `JWT_SECRET`.** The app refuses to start if the secret is shorter than 32 bytes. Generate one, e.g. `openssl rand -base64 48`.

### 3. Build & run

```bash
cd backend

# Run in development (Flyway migrates on boot)
mvn spring-boot:run

# …or build a runnable jar and start it
mvn clean package
java -jar target/whosdrunk-backend-0.1.0.jar
```

Example with production-style overrides:

```bash
DB_PASSWORD='…' JWT_SECRET="$(openssl rand -base64 48)" \
  java -jar target/whosdrunk-backend-0.1.0.jar
```

The API is now at `http://localhost:8080`, with interactive docs at **`http://localhost:8080/docs`** (Swagger UI).

> No Maven wrapper is committed. If you prefer one, run `mvn wrapper:wrapper` in `backend/` to generate `./mvnw`.

---

## 📱 Frontend — getting started

### Prerequisites
- **Node.js 18+** and npm
- **Expo CLI** (used via `npx`, no global install needed)
- Expo Go app **or** a development build (see push-notification note below)

### 1. Install dependencies

```bash
cd mobile
npm install

# Align native module versions with the Expo SDK:
npx expo install
```

### 2. Point the app at your backend

The app reads `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:8080`). Create `mobile/.env`:

```bash
# Android emulator → host machine
echo "EXPO_PUBLIC_API_URL=http://10.0.2.2:8080" > .env
```

| Device | Use |
|--------|-----|
| Android emulator | `http://10.0.2.2:8080` |
| iOS simulator | `http://localhost:8080` |
| Physical device | `http://<your-LAN-IP>:8080` |

### 3. Run

```bash
npx expo start
```

Scan the QR with Expo Go, or press `a` / `i` for the Android/iOS emulator.

### Type-check (recommended before commits)

```bash
npm run typecheck
```

---

## 🔔 Production note: Push notifications require EAS

The "Sorpasso" push notifications and their deep-linking **will not work out of the box in Expo Go or on a simulator**. Real push delivery needs:

1. **An EAS (Expo Application Services) project.** Create one and link it:
   ```bash
   npm install -g eas-cli
   eas login
   eas init           # creates the project and writes its ID
   ```
2. **The project ID wired into the app config.** Add it to `mobile/app.json` under `expo.extra.eas.projectId`:
   ```json
   {
     "expo": {
       "extra": { "eas": { "projectId": "your-eas-project-id" } }
     }
   }
   ```
   Without it, `getExpoPushTokenAsync()` cannot mint a token. The app **degrades gracefully**: it simply skips token registration and no push is sent — nothing crashes.
3. **A development or production build on a physical device:**
   ```bash
   eas build --profile development --platform android   # or ios
   ```
   Expo Go cannot receive remote push notifications, and simulators/emulators don't issue push tokens. You must run a real build on a real device.

Everything else (auth, leagues, logging, leaderboard, stats, hall of fame) works fully in Expo Go against a local backend.

---

## 🔑 Key API endpoints

All under `/api/v1`. Protected routes need `Authorization: Bearer <accessToken>`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` · `/auth/login` · `/auth/refresh` | Authentication |
| `POST` · `GET` | `/leagues` · `/leagues/join` | Create / list / join leagues |
| `GET` · `POST` | `/leagues/{id}/seasons` (+ `/active`, `/{sid}/activate`, `/{sid}/close`) | Seasons & history |
| `GET` | `/drinks/search?q=` | Catalog search (local + Open Food Facts) |
| `POST` | `/consumptions` | Log a drink (user from token) |
| `GET` | `/leagues/{id}/leaderboard` | Season ranking |
| `GET` | `/leagues/{id}/stats` | League insights |
| `POST` | `/users/me/device-tokens` | Register an Expo push token |

---

## ✅ Status

V1 / MVP feature-complete. Single-node deployment assumed (the monthly rollover uses an in-process `@Scheduled` job; for multi-node, add a distributed lock such as ShedLock).
