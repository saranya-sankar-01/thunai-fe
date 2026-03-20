interface StripProduct {
    id: string;
    object: string;
    active: boolean;
    created: number;
    default_price: string;
    description: string;
    images: string[];
    marketing_features: unknown[];
    livemode: boolean;
    metadata: Record<string, string>;
    name: string;
    package_dimensions: unknown | null;
    shippable: boolean | null;
    statement_descriptor: string | null;
    tax_code: string | null;
    unit_label: string | null;
    updated: number;
    url: string | null;
}

interface StripRecurring {
    aggregate_usage: string | null;
    interval: string;
    interval_count: number;
    trial_period_days: number | null;
    usage_type: string;
}

interface StripPrice {
    id: string;
    object: string;
    active: boolean;
    billing_scheme: string;
    created: number;
    currency: string;
    custom_unit_amount: number | null;
    livemode: boolean;
    lookup_key: string | null;
    metadata: Record<string, string>;
    nickname: string | null;
    tax_behaviour: string;
    tires_mode: string | null;
    transform_quantity: number | null;
    type: string;
    unit_amount: number;
    unit_amount_decimal: string;
    no_of_days: number;
    product: StripProduct;
    recurring: StripRecurring;
}

interface StripPlan {
    strip_plan: StripPrice[]
}

export interface SubscriptionPlan {
    name: string;
    display_name: string;
    description: string;
    default_price: string|null;
    tenants: number;
    storage: number;
    credits: number;
    current_plan: boolean;
    trial_days: number;
    seats: null | number;
    strip_plan: StripPlan;
    features: Record<string, string>[];
    feature_mapping: Record<string, string | number | null>
}