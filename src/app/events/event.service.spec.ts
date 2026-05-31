import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { lastValueFrom } from 'rxjs';
import { EventService } from './event.service';
import { FleetEvent } from './event.model';

const MOCK_EVENTS: FleetEvent[] = [
  { id: 'evt_001', vehicle_id: 'veh_001', device_id: 'dev_001', type: 'gps_ping', timestamp: '2026-04-30T10:00:00Z', location: { lat: 43.7, lng: -79.4 }, payload: { speed_mph: 60 } },
  { id: 'evt_002', vehicle_id: 'veh_001', device_id: 'dev_001', type: 'harsh_brake', timestamp: '2026-04-30T11:00:00Z', location: { lat: 43.8, lng: -79.5 }, payload: {} },
  { id: 'evt_003', vehicle_id: 'veh_002', device_id: 'dev_002', type: 'ignition_on', timestamp: '2026-04-30T09:00:00Z', location: { lat: 40.7, lng: -74.0 }, payload: {} },
];

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns only events for the given vehicle ID', async () => {
    const p = lastValueFrom(service.getByVehicleId('veh_001'));
    httpMock.expectOne('/dataset/events.json').flush(MOCK_EVENTS);
    const events = await p;
    expect(events.length).toBe(2);
    expect(events.every(e => e.vehicle_id === 'veh_001')).toBe(true);
  });

  it('returns all event types belonging to that vehicle', async () => {
    const p = lastValueFrom(service.getByVehicleId('veh_001'));
    httpMock.expectOne('/dataset/events.json').flush(MOCK_EVENTS);
    const events = await p;
    const types = events.map(e => e.type);
    expect(types).toContain('gps_ping');
    expect(types).toContain('harsh_brake');
  });

  it('returns empty array for a vehicle with no events', async () => {
    const p = lastValueFrom(service.getByVehicleId('veh_999'));
    httpMock.expectOne('/dataset/events.json').flush(MOCK_EVENTS);
    const events = await p;
    expect(events.length).toBe(0);
  });

  it('does not return events from other vehicles', async () => {
    const p = lastValueFrom(service.getByVehicleId('veh_002'));
    httpMock.expectOne('/dataset/events.json').flush(MOCK_EVENTS);
    const events = await p;
    expect(events.length).toBe(1);
    expect(events[0].id).toBe('evt_003');
  });
});
