# Dataset Reference

Static JSON files served from `public/dataset/`. All records are synthetic.

---

## Files at a glance

| File | Records | Primary key |
|---|---|---|
| `vehicles.json` | 500 | `id` (`veh_NNNN`) |
| `devices.json` | 500 | `id` (`dev_NNNN`) |
| `accounts.json` | 50 | `id` (`acc_NNNN`) |
| `users.json` | 200 | `id` (`usr_NNNN`) |
| `events.json` | ~3 500 | `id` (`evt_NNNN`) |
| `exports.json` | 50 | `id` (`exp_NNNN`) |
| `permissions.json` | 212 | composite (`user_id` + `account_id`) |

---

## vehicles.json

Each row is one fleet vehicle.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Primary key |
| `account_id` | string | FK → `accounts.id` |
| `vin` | string | 17-char vehicle identification number |
| `plate` | string | Licence plate |
| `make` | string | `Mercedes`, `Chevy`, `Ram`, `Toyota`, `Ford` |
| `model` | string | e.g. `Sprinter`, `Silverado`, `ProMaster` |
| `year` | number | Model year |
| `device_id` | string | FK → `devices.id` (1-to-1) |
| `status` | string | `active`, `parked`, `decommissioned`, `in_maintenance` |
| `last_known_location` | object \| null | `{ lat, lng, recorded_at }` — **null for ~15 vehicles** |

---

## devices.json

One GPS/telematics device per vehicle.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Primary key |
| `vehicle_id` | string | FK → `vehicles.id` |
| `serial` | string | Hardware serial number |
| `firmware` | string | Semver string, e.g. `2.3.2` |
| `last_seen_at` | string | ISO 8601 timestamp |
| `battery_pct` | number | 0–100 |
| `signal_strength` | number | Arbitrary unit |

---

## accounts.json

Fleet operator accounts (50 total, spanning 7 industries).

| Field | Type | Notes |
|---|---|---|
| `id` | string | Primary key |
| `name` | string | Company name |
| `industry` | string | `logistics`, `delivery`, `waste_mgmt`, `construction`, `field_service`, `rideshare`, `agriculture` |
| `contact_name` | string | |
| `contact_email` | string | |
| `address` | string | |
| `created_at` | string | ISO 8601 |
| `tier` | string | `free`, `pro`, `enterprise` |

---

## users.json

Platform users belonging to accounts.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Primary key |
| `email` | string | |
| `name` | string | |
| `account_id` | string | FK → `accounts.id` |
| `role` | string | `admin`, `dispatcher`, `viewer` |
| `last_login_at` | string | ISO 8601 |

---

## events.json

Telemetry and operational events emitted by devices (~3 500 records).

| Field | Type | Notes |
|---|---|---|
| `id` | string | Primary key |
| `vehicle_id` | string | FK → `vehicles.id` |
| `device_id` | string | FK → `devices.id` |
| `type` | string | `gps_ping`, `harsh_brake`, `ignition_on`, `ignition_off`, `geofence_enter`, `geofence_exit` |
| `timestamp` | string | ISO 8601 |
| `location` | object \| null | `{ lat, lng }` |
| `payload` | object | Type-specific metadata |

---

## exports.json

Data export jobs requested by account users.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Primary key |
| `account_id` | string | FK → `accounts.id` |
| `requested_by` | string | FK → `users.id` |
| `requested_at` | string | ISO 8601 |
| `status` | string | `queued`, `running`, `completed`, `failed`, `stuck` |
| `row_count` | number \| null | Populated on completion |
| `error` | string \| null | Populated on failure |

---

## permissions.json

Many-to-many mapping of users to accounts with a scope.

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | FK → `users.id` |
| `account_id` | string | FK → `accounts.id` |
| `scope` | string | `full`, `limited`, `none` |

---

## Key relationships

```
accounts ──< vehicles >── devices
accounts ──< users
users    ──< permissions >── accounts   (cross-account access)
vehicles ──< events
devices  ──< events
accounts ──< exports
```

## Edge cases worth noting

- **Null locations** — ~15 vehicles have `last_known_location: null` (device never reported or decommissioned before first ping). UI must handle this.
- **`decommissioned` vehicles** — still present in the list; filter logic should decide whether to show them by default.
- **`stuck` exports** — export jobs that are neither completed nor failed. Requires its own UI treatment.
- **`none` permission scope** — a user explicitly has no access to an account despite having a permission record.
