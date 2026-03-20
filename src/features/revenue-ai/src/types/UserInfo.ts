interface Profile {
    user_id: string;
    emailid: string;
    username: string;
    role: string;
    permissions: string;
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

export interface UserInfo {
    csrf_token: string;
    csrf_valid_until: string;
    access_token: string;
    refresh_token: string;
    expires_in: string;
    default_tenant_id: string;
    urlidentifier: string;
    profile?: Profile;
    subscription?: Subscription;
    [key: string]: any;
}
