interface Confidence {
    name: string;
    percentage: string;
}

interface Indicators {
    name: string;
}

interface Stage {
    name: string;
    description: string;
}

export interface OpportunityConfig {
    id: string;
    confidence: Confidence[];
    definition: string;
    indicators: Indicators[];
    stages: Stage[];
    tenant_id: string;
    updated: string;
}