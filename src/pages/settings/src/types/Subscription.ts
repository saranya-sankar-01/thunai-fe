interface Details {
  id: string;
  name: string;
  tenant_id: string;
  created_by: string;
  created: string;
  updated: string;
}

interface DefaultTenant {
  tenant_id: string;
  details: Details;
}

interface Usage {
  credits: number;
  storage: number;
  tenants: number;
}

interface Subscription {
  credits: number | null;
  last_payment_done: string | null;
  last_payment_link: string | null;
  last_payment_status: string | null;
  name: string;
  no_of_days: number | null;
  no_of_days_with_negative: number | null;
  storage: number | null;
  tenants: number | null;
  trial_active: boolean;
  trial_days: number;
  trial_done: boolean;
}

export interface SubscriptionItem {
  credits_warning: unknown;
  default_tenant: DefaultTenant;
  feature_mapping: Record<string, string | number | null>;
  storage_percentage: number;
  subscription: Subscription
  threshold: number;
  trial_days_remaining: number;
  usage: Usage;
}
