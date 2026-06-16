# Who's Drunk — Backend

API y motor de puntuación de la liga de consumo. Spring Boot 3.3 · Java 21 · PostgreSQL 16 · Flyway.

## Requisitos
- JDK 21
- Maven 3.9+
- PostgreSQL 16 (local o Docker)

## Arranque rápido

```bash
# 1. Levanta Postgres (ejemplo con Docker)
docker run --name whosdrunk-db -e POSTGRES_USER=whosdrunk \
  -e POSTGRES_PASSWORD=whosdrunk -e POSTGRES_DB=whosdrunk \
  -p 5432:5432 -d postgres:16

# 2. Ejecuta la app (Flyway aplica las migraciones al arrancar)
./mvnw spring-boot:run

# 3. Documentación interactiva de la API
open http://localhost:8080/docs
```

Variables de entorno: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `PORT`, `COCKTAILDB_KEY`.

## Estructura

```
src/main/java/com/whosdrunk/
├── domain/        Entidades JPA por agregado (user, league, season, catalog, consumption)
├── repository/    Spring Data JPA + proyección de leaderboard
├── scoring/       Motor de puntuación (Strategy SOLID) + ScoringService
├── catalog/       Cliente Open Food Facts + AbvResolver con caché y circuit breaker
├── api/           Controllers REST + DTOs + manejo de errores
src/main/resources/
├── application.yml
└── db/migration/  Migraciones Flyway (V1, V2, V3)
```

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/consumptions` | Registra un consumo y calcula sus puntos |
| `GET`  | `/api/v1/leagues/{leagueId}/leaderboard` | Ranking de la temporada activa |

### Ejemplo: registrar un consumo

```bash
curl -X POST http://localhost:8080/api/v1/consumptions \
  -H "Content-Type: application/json" \
  -d '{
        "userId": "11111111-1111-1111-1111-111111111111",
        "leagueId": "22222222-2222-2222-2222-222222222222",
        "drinkId": "33333333-3333-3333-3333-333333333333",
        "servingFormatId": 1,
        "quantity": 1.0
      }'
```

Respuesta:
```json
{ "consumptionId": "...", "pureAlcoholGrams": 7.890, "points": 0.79, "scoringMode": "PURE_ALCOHOL" }
```

## Motor de puntuación

```
gramos_alcohol_puro = volumen_ml × (abv / 100) × 0.789 × cantidad
puntos              = (gramos / gramos_por_unidad) × multiplicador_liga
```

`0.789 g/ml` = densidad del etanol. `gramos_por_unidad` = 10 (UBE España) configurable por liga.
La estrategia se selecciona por `league.scoring_mode` (patrón Strategy, extensible sin tocar el servicio).

## Tests

```bash
./mvnw test
```

`PureAlcoholScoringStrategyTest` valida la fórmula con casos reales (caña, tercio, chupito, copa de vino).

## Notas de producto
- Gate +18 (`User.isAdult()`) obligatorio para registrar consumos.
- Salvaguardas de consumo responsable previstas en el modelo (`responsible_use_ack`).
- En producción: sustituir `NoopRankingPublisher` por una `RedisRankingPublisher` (`@Primary`) para ranking en vivo.
