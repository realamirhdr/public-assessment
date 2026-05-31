export type EventType =
  | 'gps_ping'
  | 'harsh_brake'
  | 'ignition_on'
  | 'ignition_off'
  | 'geofence_enter'
  | 'geofence_exit';

export interface EventLocation {
  lat: number;
  lng: number | null;
}

export interface FleetEvent {
  id: string;
  vehicle_id: string;
  device_id: string;
  type: EventType;
  timestamp: string;
  location: EventLocation | null;
  payload: Record<string, unknown>;
}
