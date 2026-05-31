export type VehicleStatus = 'active' | 'parked' | 'in_maintenance' | 'decommissioned';

export const vehicleStatusLabel: Record<VehicleStatus, string> = {
  active: 'Active',
  parked: 'Parked',
  in_maintenance: 'In Maintenance',
  decommissioned: 'Decommissioned',
};

export const vehicleStatusTooltip: Record<VehicleStatus, string> = {
  active: 'Vehicle is currently on the road and reporting live data.',
  parked: 'Vehicle is stationary and not in active use.',
  in_maintenance: 'Vehicle is undergoing scheduled or unscheduled maintenance.',
  decommissioned: 'Vehicle has been retired from the fleet and is no longer operational.',
};

export type { Account, AccountTier, AccountIndustry } from '../accounts/account.model';

export interface VehicleLocation {
  lat: number;
  lng: number;
  recorded_at: string;
}

export interface Vehicle {
  id: string;
  account_id: string;
  vin: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  device_id: string;
  status: VehicleStatus;
  last_known_location: VehicleLocation | null;
}

export interface VehicleFilters {
  plate?: string;
  name?: string;
  status?: VehicleStatus;
  year?: number;
  accountId?: string;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
}

export interface VehicleViewModel {
  id: string;
  accountName: string;
  vin: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  status: VehicleStatus;
  last_known_location: VehicleLocation | null;
}
