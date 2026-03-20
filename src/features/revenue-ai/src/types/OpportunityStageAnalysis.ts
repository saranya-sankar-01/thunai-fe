export interface StageSummary {
    average_confidence_score: number;
    stage_name: string;
    total_deal_value: number;
    total_deals: number;
}

interface DetailedAnalysis {
    ai_strategic_insights: {
        focus_area: string;
        next_steps: string[];
        success_probability: string;
    }
    key_feature_requests: string[];
    opportunity_details: {
        email: string;
        owner: string;
        reference_id: string;
        title: string;
    };
    what_to_prepare: string[]
}

export interface TopDeal {
    confidence_score: number;
    money: number;
    stage: string;
    created: string;
    updated: string;
    id: string;
    reference_id: string;
    tenant_id: string;
    user_id: string;
    detailed_analysis: DetailedAnalysis;
}

export interface OpportunityStageAnalysis {
    stage_summary: StageSummary;
    top_deals: TopDeal[];
}