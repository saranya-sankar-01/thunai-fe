export interface Feature {
    title: string;
    description: string;
}

export interface Casestudy {
    team: string;
    description: string;
}

interface CallToAction {
    text: string;
    link: string;
}

interface Details {
    description: string;
    features: Feature[];
    case_studies: Casestudy[];
    call_to_action: CallToAction;
}
export interface ConfigureDynamciFieldInput {
    field: string;
    type: string;
    label: string;
    formControlName?: string;
    returnValue?: string;
    displayValue?: string;
    options?: any[];
    value_from?: string[];
    visibleIf?: { formControlName?: string; field?: string; value: any };
    function?: string
}
export interface ConfigureDynamicField {
    commonLabel: string;
    subLabel: string;
    inputs: ConfigureDynamciFieldInput[];
    tooltip: string
}

export interface Application {
    id: string;
    name: string;
    display_name: string;
    fields: Record<string, unknown>;
    static_fields: Record<string, unknown>;
    action_fields: Record<string, unknown>;
    configure_dynamic_fields: ConfigureDynamicField[];
    dynamic_fields: ConfigureDynamicField[];
    categories: string[];
    logo: string;
    details: Details;
    type: string;
    oauth_flow: boolean;
    multiple_account: boolean;
    docs_uri: string;
    is_connected: boolean;
    is_oauth_connected: boolean;
    oauth_application_id: string | null;
    application_id: string | null;
    application_ids: any[] | null;
    application_identities: any[] | null;
    is_action_connected: boolean;
    action_application_id: string | null;
    user_connect_enable: boolean;
    admin_configure_enable: boolean;
    revenue_enabled: boolean;
}
