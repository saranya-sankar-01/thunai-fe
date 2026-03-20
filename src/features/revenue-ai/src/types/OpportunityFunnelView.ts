export interface OpportunityFunnel {
    confidence_score: number;
    currency: string;
    money: number;
    opportunity_id: string;
    owner: string;
    stage: string;
    tenant_id: string;
    title: string;
    user_id: string;
    created: string;
}

export interface StageData {
    count: number;
    total_money: number;
    currency: string;
    opportunities: OpportunityFunnel[];
}

export interface OpportunityFunnelView {
    opportunities: {
        [stageName: string]: StageData;
    }
}