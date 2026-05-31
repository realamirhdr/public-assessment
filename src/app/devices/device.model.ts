export interface Device {
  id: string;
  vehicle_id: string;
  serial: string;
  firmware: string;
  last_seen_at: string;
  battery_pct: number;
  signal_strength: number;
}
