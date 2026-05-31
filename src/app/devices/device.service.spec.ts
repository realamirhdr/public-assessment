import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { lastValueFrom } from 'rxjs';
import { DeviceService } from './device.service';
import { Device } from './device.model';

const MOCK_DEVICES: Device[] = [
  { id: 'dev_001', vehicle_id: 'veh_001', serial: 'SN-ALPHA', firmware: '2.3.1', last_seen_at: '2026-04-30T10:00:00Z', battery_pct: 85, signal_strength: 72 },
  { id: 'dev_002', vehicle_id: 'veh_002', serial: 'SN-BETA', firmware: '1.9.0', last_seen_at: '2026-04-29T08:00:00Z', battery_pct: 12, signal_strength: 30 },
  { id: 'dev_003', vehicle_id: 'veh_003', serial: 'SN-GAMMA', firmware: '3.0.0', last_seen_at: '2026-04-28T06:00:00Z', battery_pct: 55, signal_strength: 60 },
];

describe('DeviceService', () => {
  let service: DeviceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DeviceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll returns all devices', async () => {
    const p = lastValueFrom(service.getAll());
    httpMock.expectOne('/dataset/devices.json').flush(MOCK_DEVICES);
    const devices = await p;
    expect(devices.length).toBe(3);
  });

  it('getByVehicleId returns the correct device', async () => {
    const p = lastValueFrom(service.getByVehicleId('veh_001'));
    httpMock.expectOne('/dataset/devices.json').flush(MOCK_DEVICES);
    const device = await p;
    expect(device).toBeDefined();
    expect(device!.serial).toBe('SN-ALPHA');
    expect(device!.battery_pct).toBe(85);
  });

  it('getByVehicleId returns undefined for an unknown vehicle', async () => {
    const p = lastValueFrom(service.getByVehicleId('veh_999'));
    httpMock.expectOne('/dataset/devices.json').flush(MOCK_DEVICES);
    const device = await p;
    expect(device).toBeUndefined();
  });

  it('getByVehicleId returns device with correct low battery value', async () => {
    const p = lastValueFrom(service.getByVehicleId('veh_002'));
    httpMock.expectOne('/dataset/devices.json').flush(MOCK_DEVICES);
    const device = await p;
    expect(device!.battery_pct).toBe(12);
  });
});
