# Who's Drunk — Arquitectura, Stack y Diseño Técnico

> Documento maestro de arquitectura. App social y gamificada de "Ligas de consumo" entre grupos de amigos por temporadas.
> Versión 0.1 · Stack: **React Native (Expo) + Spring Boot (Java 21) + PostgreSQL 16**

---

## 0. Aviso responsable (no técnico, pero importante)

El producto gamifica el consumo de alcohol. Independientemente de la viabilidad técnica, el diseño debe incluir desde el día 1 salvaguardas de producto: verificación de edad (+18), límites/avisos de consumo de riesgo, posibilidad de ocultar o pausar la propia participación, y mensajes de consumo responsable. A nivel de datos esto se traduce en flags (`birth_date`, `responsible_use_ack`) y en límites configurables por liga. Lo dejo modelado en el esquema aunque la lógica de negocio de avisos quede fuera del scaffolding inicial.

---

## 1. Resumen ejecutivo del stack

| Capa | Tecnología elegida | Por qué |
|------|--------------------|---------|
| **Móvil** | React Native + **Expo** (TypeScript) | Un solo código iOS/Android, OTA updates (releases sin pasar por store para hotfixes), ecosistema enorme, ideal para iteración rápida de un producto social. TypeScript de punta a punta facilita compartir tipos generados desde el contrato OpenAPI del backend. |
| **Backend** | **Spring Boot 3.3 / Java 21** | Plataforma madura, fuertemente tipada, con un ecosistema inmejorable para modelar dominio complejo (JPA/Hibernate), seguridad (Spring Security + JWT), validación, transaccionalidad ACID y testing. Virtual threads (Java 21) dan gran throughput de I/O para el motor de puntuación sin código reactivo. |
| **Base de datos** | **PostgreSQL 16** | El motor de puntuación necesita exactitud transaccional (consumos → ranking) → relacional ACID. Postgres añade JSONB (para snapshots de catálogo externo), índices parciales/compuestos para leaderboards, y window functions perfectas para rankings. |
| **Caché / tiempo real** | **Redis** | Cache de leaderboards (sorted sets = ranking nativo O(log n)), rate-limiting del scraping de catálogo, y pub/sub para empujar actualizaciones de ranking en vivo. |
| **Migraciones** | **Flyway** | Versionado del esquema SQL reproducible y auditable. |
| **Contrato API** | **OpenAPI 3 (springdoc)** | Genera la spec automáticamente; el cliente RN consume tipos TS generados. Una sola fuente de verdad. |
| **Infra** | Docker + (Fly.io / Railway / AWS ECS) | Contenedores; Postgres y Redis gestionados. |

### ¿Por qué NO microservicios (todavía)
Para un MVP, un **monolito modular** bien empaquetado (paquetes por dominio: `user`, `league`, `season`, `catalog`, `consumption`, `scoring`) da el 90% de los beneficios de los microservicios sin su coste operativo. Las fronteras de módulo están limpias por si en el futuro se extrae `catalog` (ingesta de APIs externas) o `scoring` como servicio independiente.

---

## 2. Vista de arquitectura (alto nivel)

```
┌─────────────────────────┐         ┌──────────────────────────────────────────────┐
│   App móvil (Expo / RN)  │  HTTPS  │              Backend Spring Boot               │
│  - Auth (JWT en Secure   │ ──────▶ │  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│    Store)                │  REST   │  │  api/    │  │ scoring/ │  │   catalog/   │ │
│  - Registro de consumos  │ ◀────── │  │ (REST)   │  │ (motor)  │  │ (ingesta API)│ │
│  - Leaderboards en vivo  │  JSON   │  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│  - Ligas / invitaciones  │         │       │             │               │         │
└─────────────────────────┘         │  ┌────▼─────────────▼───────────────▼──────┐ │
            ▲                        │  │           Domain + Repositories          │ │
            │  WebSocket / SSE       │  └──────────────────┬───────────────────────┘ │
            │  (ranking push)        └─────────────────────┼─────────────────────────┘
            │                                               │
            │                          ┌────────────────────┼─────────────────┐
            └──────────────────────────┤                    │                 │
                                  ┌─────▼─────┐       ┌──────▼──────┐   ┌──────▼───────┐
                                  │ PostgreSQL│       │    Redis    │   │ APIs externas│
                                  │ (verdad)  │       │ (cache/RT)  │   │ OpenFoodFacts│
                                  └───────────┘       └─────────────┘   │ CocktailDB…  │
                                                                        └──────────────┘
```

**Flujo crítico (registro de consumo → ranking):**
1. El usuario selecciona bebida + formato + marca en la app.
2. `POST /api/v1/consumptions` con `{drinkId | freeText, servingFormatId, quantity, occurredAt}`.
3. El backend resuelve el **ABV** (desde catálogo local; si falta, lo busca en API externa y lo cachea).
4. `ScoringService` calcula **gramos de alcohol puro** y **puntos** y persiste `Consumption` + `ConsumptionScore` en una transacción.
5. Se actualiza el sorted set de Redis del leaderboard de la temporada activa de cada liga del usuario.
6. Se emite un evento (SSE/WebSocket) para refrescar el ranking en vivo.

---

## 3. Modelo de datos

### 3.1 Diagrama entidad-relación (lógico)

```
users ──< league_memberships >── leagues ──< seasons ──< consumptions >── drinks ──> drink_brands
  │              │                                  │           │            │
  │              └ role (OWNER/ADMIN/MEMBER)        │           │            └ drink_type (BEER/SPIRIT/WINE…)
  │                                                 │           │
  └ birth_date, display_name…           invite_code │           └ serving_formats (caña/jarra/tercio/copa/chupito)
                                                     │
                                          consumption_scores (1:1 con consumption: pure_alcohol_g, points)
```

### 3.2 Entidades y razón de ser

| Tabla | Propósito | Notas de diseño |
|-------|-----------|-----------------|
| `users` | Cuenta de usuario | `birth_date` para gate +18; `auth_provider` para social login futuro. |
| `leagues` | Liga privada | `invite_code` único e indexado (código de invitación). `scoring_mode` configurable por liga. |
| `league_memberships` | N:M usuario↔liga | Incluye `role` (OWNER/ADMIN/MEMBER). PK compuesta (user_id, league_id). |
| `seasons` | Temporada (por defecto mensual) | `status` (SCHEDULED/ACTIVE/CLOSED), `starts_at`/`ends_at`. Una liga tiene historial de temporadas. |
| `drink_types` | Catálogo de tipos | Enum gestionado en tabla: CERVEZA, DESTILADO, VINO, SIDRA, COCTEL, OTRO. |
| `drink_brands` | Marca/producto | Mapea a fuentes externas (`source`, `source_ref`, `barcode`). |
| `drinks` | Bebida concreta con ABV | `abv` (% vol). `abv_source` (MANUAL/OPENFOODFACTS/COCKTAILDB/DEFAULT). `abv_confidence`. |
| `serving_formats` | Formatos/volúmenes | caña=200ml, jarra=500ml, tercio=330ml, copa=150ml(vino)/50ml(destilado), chupito=40ml. `default_volume_ml`, configurable. |
| `consumptions` | Registro de un consumo | Snapshot inmutable: guarda `abv_snapshot` y `volume_ml_snapshot` para que recalcular catálogo no altere el histórico. |
| `consumption_scores` | Resultado del cálculo (1:1) | `pure_alcohol_grams`, `points`. Separado de `consumptions` para aislar el motor de puntuación (SRP). |
| `catalog_lookups` | Caché de llamadas a API externa | TTL, `payload` JSONB, evita saturar APIs externas. |

### 3.3 Decisiones clave del modelo

- **Snapshots inmutables en `consumptions`.** El ABV de una bebida puede corregirse en el catálogo (mejor dato de la API), pero un consumo ya registrado **no debe cambiar de puntos retroactivamente**. Por eso `consumptions` copia `abv_snapshot` y `volume_ml_snapshot` en el momento del registro.
- **`consumption_scores` separada.** Permite reglas de puntuación versionadas (`scoring_version`) y recálculos controlados sin tocar el hecho registrado. Cumple SRP: el "hecho" (consumo) y su "valoración" (puntos) son responsabilidades distintas.
- **Catálogo dinámico, no estático.** `drinks`/`drink_brands` se rellenan bajo demanda desde APIs externas y se cachean. La app nunca depende de que el dato exista de antemano.
- **Multi-liga.** Un usuario puede estar en varias ligas; el mismo consumo cuenta para todas sus ligas con temporada activa (decisión de producto; alternativa: consumo ligado a una liga concreta — el modelo soporta ambas vía `consumptions.league_id` nullable).

El esquema SQL completo está en `backend/src/main/resources/db/migration/`.

---

## 4. Estrategia de APIs externas (catálogo dinámico de bebidas + ABV)

### 4.1 Fuentes (gratuitas, reales)

| Fuente | Cubre | ABV disponible | Coste |
|--------|-------|----------------|-------|
| **Open Food Facts** (`world.openfoodfacts.org/api/v2`) | Cervezas, vinos, sidras, destilados embotellados, por marca y **código de barras** | `nutriments.alcohol_value` + `nutriments.alcohol_unit` (`% vol`) y `nutriments.alcohol_100g` | Gratis, abierto (ODbL). Pide `User-Agent` identificativo. |
| **TheCocktailDB** (`thecocktaildb.com/api`) | Cócteles e ingredientes (destilados) | ABV de ingredientes/licores | Gratis (key de test `1`); plan Patreon para producción |
| **Open Brewery DB** | Metadatos de cervecerías (no ABV) | No | Gratis (enriquecer marcas) |
| **Tabla `defaults` interna** | Fallback por tipo de bebida | ABV típico (cerveza 5%, vino 12.5%, destilado 40%…) | — |

> **Por qué Open Food Facts como primaria:** es la única base abierta, gratuita y masiva con ABV real por producto y búsqueda por **código de barras** — clave para que el usuario escanee la botella y obtenga marca + grado automáticamente. Campo de interés: `product.nutriments.alcohol_value` (con `alcohol_unit = "% vol"`).

### 4.2 Estrategia de resolución de ABV (cascada con caché)

```
resolveAbv(query):
  1. ¿Existe drink en catálogo local con abv?  → úsalo (0 llamadas externas)
  2. ¿Hay entrada en catalog_lookups vigente (TTL)? → úsala
  3. Llama Open Food Facts (por barcode o nombre+marca)
        ├─ éxito → persiste drink + cachea lookup (abv_source=OPENFOODFACTS)
        └─ fallo/sin dato → 4
  4. Si es cóctel → TheCocktailDB
  5. Fallback → defaults por drink_type (abv_source=DEFAULT, abv_confidence=LOW)
```

### 4.3 Anti-saturación de APIs externas (puntos clave)

- **Cache-aside con `catalog_lookups`** (tabla + `payload` JSONB) y TTL configurable (p. ej. 30 días para ABV, que casi nunca cambia).
- **Rate limiting saliente** con un bucket en Redis por fuente (respetar límites de OFF: ~100 req/min en lectura).
- **Persistencia progresiva**: el primer usuario que registra una marca nueva "paga" la llamada externa; el resto la sirve desde el catálogo local. El catálogo se auto-enriquece con el uso.
- **Ingesta batch nocturna opcional** (`@Scheduled`) que pre-popula las marcas más consumidas y refresca ABVs de baja confianza.
- **Circuit breaker** (Resilience4j) hacia cada fuente: si OFF cae, se degrada a defaults sin romper el registro de consumo.
- **`User-Agent` identificativo** obligatorio en OFF (`WhosDrunk/0.1 (contacto@...)`).

El cliente está en `backend/.../catalog/` (`OpenFoodFactsClient`, `CatalogService`, `AbvResolver`).

---

## 5. El motor de puntuación

### 5.1 Fórmula física (alcohol puro)

```
gramos_alcohol_puro = volumen_ml × (ABV / 100) × 0.789
```
donde **0.789 g/ml** es la densidad del etanol a 20 °C. Es la base científica estándar (la misma que usan las "unidades de bebida").

### 5.2 De gramos a puntos

Se usa la **Unidad de Bebida Estándar (UBE) española = 10 g de alcohol puro** como unidad base (en UK son 8 g; configurable por liga vía `scoring_mode`).

```
puntos_base = gramos_alcohol_puro / gramos_por_unidad   (gramos_por_unidad = 10 por defecto)
puntos = round(puntos_base × multiplicador_liga, 2)
```

Ejemplos (multiplicador 1.0, 10 g/unidad):
- **Caña** (200 ml, cerveza 5%): 200 × 0.05 × 0.789 = **7.89 g** → 0.79 puntos
- **Tercio** (330 ml, cerveza 5%): **13.02 g** → 1.30 puntos
- **Chupito** (40 ml, destilado 40%): **12.62 g** → 1.26 puntos
- **Copa de vino** (150 ml, 12.5%): **14.79 g** → 1.48 puntos

### 5.3 Diseño SOLID del motor

- **SRP:** `ScoringService` orquesta; el cálculo puro vive en `ScoringStrategy`; la persistencia en repositorios.
- **OCP / Strategy:** `ScoringStrategy` es una interfaz. `PureAlcoholScoringStrategy` es la implementación por defecto. Se pueden añadir estrategias (p. ej. `HandicapScoringStrategy`, modos de fiesta con bonus) **sin tocar** el servicio — se seleccionan por `league.scoring_mode`.
- **DIP:** `ScoringService` depende de la abstracción `ScoringStrategy` y de interfaces de repositorio, no de implementaciones.
- **Inmutabilidad:** el cálculo opera sobre un `value object` `ScoringInput` y devuelve `ScoringResult` (records de Java); sin efectos colaterales.
- **Versionado:** cada `ScoringResult` lleva `scoringVersion` para auditoría y recálculos reproducibles.

Código en `backend/.../scoring/`.

### 5.4 Ranking en tiempo real

- Al persistir un `ConsumptionScore`, se hace `ZINCRBY leaderboard:{seasonId} {points} {userId}` en Redis (sorted set).
- `GET /api/v1/leagues/{id}/leaderboard` lee `ZREVRANGE` (O(log n)) y rellena con datos de usuario. Postgres es la fuente de verdad para reconstruir el sorted set si se pierde la caché (window function `RANK() OVER (PARTITION BY season ORDER BY SUM(points) DESC)`).
- Push opcional vía SSE/WebSocket al canal de la liga.

---

## 6. Seguridad y autenticación

- **Spring Security + JWT** (access token corto + refresh token). En la app, tokens en `expo-secure-store`.
- Social login (Apple/Google) vía OAuth2 (`auth_provider`, `auth_subject`).
- **Gate +18**: `birth_date` obligatorio en alta; endpoints de consumo rechazan menores.
- Autorización por liga: solo miembros leen/escriben en su liga; `OWNER/ADMIN` gestionan temporadas e invitaciones.
- Validación con Bean Validation (`@Valid`) en todos los DTO de entrada.

---

## 7. Estructura del repositorio

```
Who's-Drunk/
├── ARQUITECTURA.md                ← este documento
└── backend/
    ├── pom.xml
    ├── README.md
    └── src/main/
        ├── java/com/whosdrunk/
        │   ├── WhosDrunkApplication.java
        │   ├── domain/            ← entidades JPA por agregado
        │   │   ├── user/  league/  season/  catalog/  consumption/
        │   ├── repository/        ← Spring Data JPA
        │   ├── scoring/           ← motor de puntuación (Strategy, SOLID)
        │   ├── catalog/           ← clientes API externa + caché + AbvResolver
        │   ├── api/               ← controllers REST + DTOs
        │   └── config/            ← seguridad, beans
        └── resources/
            ├── application.yml
            └── db/migration/      ← Flyway (V1, V2, V3)
```

El frontend (Expo) se añadirá en `mobile/` en una iteración siguiente; este entregable se centra en backend + modelo de datos + motor, que es el núcleo de riesgo técnico.

---

## 8. Roadmap técnico sugerido

1. **Fase 0 (este entregable):** esquema de datos, entidades, motor de puntuación, contrato REST de consumos y leaderboard.
2. **Fase 1:** Auth (JWT + social), CRUD de ligas e invitaciones, ciclo de temporadas (`@Scheduled` para abrir/cerrar mensualmente).
3. **Fase 2:** Ingesta de catálogo (OFF + escaneo de código de barras desde la app), caché y rate limiting.
4. **Fase 3:** Tiempo real (Redis sorted sets + SSE), leaderboards históricos, logros/badges gamificados.
5. **Fase 4:** App Expo completa, push notifications, pulido de UX y salvaguardas de consumo responsable.

---

*Fuentes de APIs de bebidas:*
- [Open Food Facts API](https://openfoodfacts.github.io/openfoodfacts-server/api/)
- [TheCocktailDB API](https://www.thecocktaildb.com/api.php)
- [Open Brewery DB](https://www.openbrewerydb.org/)
