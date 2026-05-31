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
