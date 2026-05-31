import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { lastValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './vehicle.model';

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'veh_001', account_id: 'acc_001', vin: 'VIN1', plate: 'ABC123',
    make: 'Ford', model: 'Transit', year: 2020, device_id: 'dev_001',
    status: 'active',
    last_known_location: { lat: 43.7, lng: -79.4, recorded_at: '2026-01-01T00:00:00Z' },
  },
  {
    id: 'veh_002', account_id: 'acc_002', vin: 'VIN2', plate: 'XYZ789',
    make: 'Mercedes', model: 'Sprinter', year: 2018, device_id: 'dev_002',
    status: 'parked',
    last_known_location: { lat: 40.7, lng: -74.0, recorded_at: '2026-01-02T00:00:00Z' },
  },
  {
    id: 'veh_003', account_id: 'acc_001', vin: 'VIN3', plate: 'DEF456',
    make: 'Ford', model: 'F-150', year: 2022, device_id: 'dev_003',
    status: 'in_maintenance', last_known_location: null,
  },
];

async function get(service: VehicleService, httpMock: HttpTestingController, filters = {}, page?: number, pageSize?: number) {
  const p = lastValueFrom(service.getVehicles(filters, page, pageSize));
  httpMock.expectOne('/dataset/vehicles.json').flush(MOCK_VEHICLES);
  vi.advanceTimersByTime(300);
  return p;
}

describe('VehicleService', () => {
  let service: VehicleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VehicleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns all vehicles when no filters applied', async () => {
    const result = await get(service, httpMock);
    expect(result.total).toBe(3);
    expect(result.items.length).toBe(3);
  });

  it('filters by plate (case insensitive)', async () => {
    const result = await get(service, httpMock, { plate: 'abc' });
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe('veh_001');
  });

  it('filters by vehicle name (make + model)', async () => {
    const result = await get(service, httpMock, { name: 'sprinter' });
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe('veh_002');
  });

  it('filters by status', async () => {
    const result = await get(service, httpMock, { status: 'parked' });
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe('veh_002');
  });

  it('filters by year', async () => {
    const result = await get(service, httpMock, { year: 2020 });
    expect(result.total).toBe(1);
    expect(result.items[0].plate).toBe('ABC123');
  });

  it('filters by accountId', async () => {
    const result = await get(service, httpMock, { accountId: 'acc_001' });
    expect(result.total).toBe(2);
    expect(result.items.every((v: Vehicle) => v.account_id === 'acc_001')).toBe(true);
  });

  it('filters by geo-bounds and excludes vehicles with no location', async () => {
    const result = await get(service, httpMock, { minLat: 42, maxLat: 45, minLng: -81, maxLng: -78 });
    // veh_001 (43.7, -79.4) is within bounds; veh_002 is outside; veh_003 has no location
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe('veh_001');
  });

  it('excludes all vehicles outside geo-bounds', async () => {
    const result = await get(service, httpMock, { minLat: 50, maxLat: 55, minLng: -80, maxLng: -70 });
    expect(result.total).toBe(0);
  });

  it('paginates and returns correct page size', async () => {
    const result = await get(service, httpMock, {}, 1, 2);
    expect(result.items.length).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(1);
  });

  it('returns correct second page', async () => {
    const result = await get(service, httpMock, {}, 2, 2);
    expect(result.items.length).toBe(1);
    expect(result.items[0].id).toBe('veh_003');
  });

  it('returns all results when page and pageSize are omitted', async () => {
    const result = await get(service, httpMock);
    expect(result.totalPages).toBe(1);
    expect(result.items.length).toBe(3);
  });

  it('returns empty result when no vehicles match the filter', async () => {
    const result = await get(service, httpMock, { plate: 'ZZZNOMATCH' });
    expect(result.total).toBe(0);
    expect(result.items.length).toBe(0);
    expect(result.totalPages).toBe(1);
  });
});
