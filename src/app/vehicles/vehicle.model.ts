export type VehicleStatus = 'active' | 'parked' | 'in_maintenance' | 'decommissioned';

export const vehicleStatusLabel: Record<VehicleStatus, string> = {
  active: 'Active',
  parked: 'Parked',
  in_maintenance: 'In Maintenance',
  decommissioned: 'Decommissioned',
};

export type AccountTier = 'free' | 'pro' | 'enterprise';

export type AccountIndustry =
  | 'logistics'
  | 'delivery'
  | 'waste_mgmt'
  | 'construction'
  | 'field_service'
  | 'rideshare'
  | 'agriculture';

export interface Account {
  id: string;
  name: string;
  industry: AccountIndustry;
  contact_name: string;
  contact_email: string;
  address: string;
  created_at: string;
  tier: AccountTier;
}

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
