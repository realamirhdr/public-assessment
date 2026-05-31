# Trax — Fleet Management Dashboard

## PR Summary

**What this does:** Replaces the minimal vehicle list starter with a fully featured two-page fleet management dashboard covering vehicles and accounts. Filtering, sorting, pagination, map view, and rich detail modals are all wired up across both pages.

**Why:** The original scaffold was a read-only table with no filtering, no navigation, no detail view, and no map. Fleet managers need to find specific vehicles quickly, understand status at a glance, dig into events and device health, and navigate across accounts — none of that existed.

**Scope of change:** New domain modules for `accounts`, `events`, `devices`, `users`, `exports`, and `layout`. The `vehicles` module was heavily extended. All data filtering moved into the service layer. Angular signals and `toObservable` + `switchMap` used throughout for reactive state without manual subscription management.

**Known limitations:**
- All data is static JSON — filtering and pagination are client-side. In production these would be server-side query params.
- The vehicle detail modal looks up account by name string match. A proper implementation would pass `account_id` through to the view model.
- No authentication — permissions exist in the data but are not enforced in the UI.
- Map performance is bounded by viewport filtering but would need marker clustering at scale.

---

## Getting started

```bash
npm install
npm start      # http://localhost:4200
npm test
npm run build
```

---

## Application structure

```
src/app/
├── accounts/          # Account list page, detail modal, model, service
├── devices/           # Device model and service
├── events/            # Event model, service, and map component
├── exports/           # Export model and service
├── layout/            # Navbar
├── users/             # User model and service (with permissions join)
└── vehicles/          # Vehicle list, map, detail modal, model, service
```

---

## Features

### Navigation

A sticky smart navbar sits at the top of every page. It hides on scroll down and reappears immediately on scroll up. Switching between pages automatically scrolls back to the top.

| Route | Page |
|---|---|
| `/vehicles` | Fleet Vehicles |
| `/accounts` | Fleet Accounts |

---

### Fleet Vehicles (`/vehicles`)

#### Filters

Five filters rendered above the table. All filtering happens in `VehicleService.getVehicles()` — the component only passes signal values as params. Filters reset pagination to page 1 on change.

| Filter | Behavior |
|---|---|
| Plate | Substring match on keypress |
| Vehicle | Substring match on make + model on keypress |
| Year | Dropdown, 1990-2026 |
| Status | Dropdown — Active, Parked, In Maintenance, Decommissioned |
| Account | Debounced autocomplete, searches by name or ID; filter applies on selection not on keypress |

Each filter has an individual x clear button. A "Clear all" button appears when any filter is active.

#### Table view

- Alternating column shading with a distinct header background
- Six sortable columns — click cycles through ascending, descending, then off
- Sort applies to the full filtered collection before pagination, not just the current page
- Rows with no data sort to the bottom regardless of sort direction
- Status values shown as color-coded badges with descriptive tooltips
- `-` shown for missing Last seen values
- **Operations** column with an info button that opens the vehicle detail modal

#### Map view

Toggle between Table and Map using the buttons in the page header. The map view:

- Uses Leaflet with OpenStreetMap tiles, defaults to the GTA at zoom 6
- Fetches only vehicles within the current viewport — bounds are passed as `minLat`, `maxLat`, `minLng`, `maxLng` filter params to the same `getVehicles()` method the table uses
- Respects all active table filters simultaneously (status, year, account, etc.)
- Markers are color-coded by vehicle status (green = active, amber = parked, red = in maintenance, gray = decommissioned)
- Hovering a marker shows a tooltip with plate, make/model, and account
- Clicking a marker opens the same vehicle detail modal as the table's info button

#### Pagination

- 20 vehicles per page
- Google-style numbered pagination with arrow buttons and ellipsis for large page counts
- Hidden in map view

#### Vehicle detail modal

Fixed-size modal (1000 x 640 px). Two tabs:

**General**
- Header: outlined plate badge, make/model/year, VIN, status badge
- Account section: name, industry, tier, contact, email (fetched and joined from accounts dataset)
- Current Device section: serial number, firmware version, battery % (green >= 50%, amber 20-49%, red < 20%), signal strength, last seen timestamp
- Last known location: timestamp and coordinates

**Events**
- Split layout — scrollable event list left, Leaflet map right
- Events sorted latest to earliest, with a device serial header inserted when the device changes
- Clicking an event flies the map to that location and enlarges the marker
- Color-coded event type badges: GPS Ping, Harsh Brake, Ignition On/Off, Geofence Enter/Exit
- Speed shown for GPS ping events
- Events with no location show a "No location" note and are skipped on the map

---

### Fleet Accounts (`/accounts`)

#### Filters

Three filters, same service-layer filtering architecture as vehicles.

| Filter | Behavior |
|---|---|
| Name | Debounced autocomplete, searches by name or ID; filter applies on selection |
| Industry | Dropdown with human-readable labels (e.g. "Waste Management" not `waste_mgmt`) |
| Tier | Dropdown — Free, Pro, Enterprise |

#### Table

- Same visual style as vehicles — center-aligned, alternating column shading, colored header
- Industry and tier shown with human-readable labels
- Tier shown as a color-coded badge (gray = free, blue = pro, amber = enterprise)
- `-` for null or empty contact fields
- 20 accounts per page with the same numbered pagination as vehicles
- **Operations** column with an info button

#### Account detail modal

Fixed-size modal. Three tabs:

**General**
- Header: company initial badge, name, tier badge, industry label
- Details: industry, member since date, address
- Contact: name and email

**Users**
- All users whose home account matches, joined with permissions from `permissions.json`
- Columns: Name, Email, Role (Admin / Dispatcher / Viewer), Permission scope (Full / Limited / None)
- Role and scope shown as color-coded badges
- Users and exports are lazy-loaded together on first tab access

**Exports**
- All data export jobs for this account
- Columns: Requested at, Status, Row count, Error message
- Status shown as color-coded badge (Queued, Running, Completed, Failed, Stuck)
- `-` for null fields

---

## Service architecture

All HTTP calls use `shareReplay(1)` — each dataset is fetched once and cached for the lifetime of the app. A single `getVehicles(filters, page?, pageSize?)` handles all vehicle filtering and pagination; omitting page/pageSize returns all matching results (used by the map).

| Service | Responsibility |
|---|---|
| `VehicleService` | Vehicles — filtering by all fields including geo-bounds, pagination |
| `AccountService` | Accounts — filtering, pagination, name/ID autocomplete search |
| `AccountSearchService` | Autocomplete search used by the vehicle list account filter |
| `EventService` | Events filtered by vehicle ID |
| `DeviceService` | Device lookup by vehicle ID; full list for event serial grouping |
| `UserService` | Users filtered by account ID, joined with permissions |
| `ExportService` | Exports filtered by account ID |

Components never filter data themselves. They build a `filterParams` computed signal from their state signals and pipe it through `toObservable(filterParams).pipe(switchMap(service.get(...)))`. When any filter signal changes, the pipe automatically cancels the previous call and issues a new one.

---

## Tests

50 tests across 8 suites covering all services. Run with `npm test`.

| Suite | Tests |
|---|---|
| `VehicleService` | No-filter, plate/name/status/year/account filters, geo-bounds, pagination, empty results |
| `AccountService` | Name/industry/tier filters, combined filters, pagination, search by name/ID, 8-result cap |
| `EventService` | Vehicle filtering, multiple event types, unknown vehicle, cross-vehicle isolation |
| `DeviceService` | All devices, correct lookup, unknown vehicle returns undefined, value integrity |
| `UserService` | Account filtering, permissions join, null scope, cross-account isolation, empty account |
| `ExportService` | Account filtering, cross-account isolation, all status types, null fields preserved |

---

## Dataset reference

See [`DATASET.md`](DATASET.md) for a full field-by-field reference of all seven JSON files, their relationships, and edge cases worth knowing (null locations, cross-account permissions, stuck exports).

---

## Original brief

See [`ORIGINAL_README.md`](ORIGINAL_README.md) for the original assessment brief and evaluation criteria.
