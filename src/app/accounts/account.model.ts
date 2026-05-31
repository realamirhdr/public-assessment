export type AccountTier = 'free' | 'pro' | 'enterprise';

export type AccountIndustry =
  | 'logistics'
  | 'delivery'
  | 'waste_mgmt'
  | 'construction'
  | 'field_service'
  | 'rideshare'
  | 'agriculture';

export const accountIndustryLabel: Record<AccountIndustry, string> = {
  logistics: 'Logistics',
  delivery: 'Delivery',
  waste_mgmt: 'Waste Management',
  construction: 'Construction',
  field_service: 'Field Service',
  rideshare: 'Rideshare',
  agriculture: 'Agriculture',
};

export const accountTierLabel: Record<AccountTier, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export interface AccountFilters {
  name?: string;
  industry?: AccountIndustry;
  tier?: AccountTier;
}

export interface Account {
  id: string;
  name: string;
  industry: AccountIndustry;
  contact_name: string | null;
  contact_email: string | null;
  address: string;
  created_at: string;
  tier: AccountTier;
}
