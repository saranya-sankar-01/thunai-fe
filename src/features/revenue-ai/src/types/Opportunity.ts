interface AssociatedContact {
    email: string;
    name: string;
}

interface Assignee {
    assignee_user_id: string;
    assignee_name: string;
    assignee_email: string;
}

interface ConfiguredStages {
    name: string;
    description: string;

}

interface DetailedAnalysis {
    ai_strategic_insights: {
        focus_area: string;
        next_steps: string[];
        success_probability: string;
    };
    key_feature_requests: any[];
    opportunity_details: {
        email: string;
        owner: string;
        reference_id: string;
        title: string;
    };
    what_to_prepare: string[];
}

interface Source {
    date: string;
    excerpt: string;
    matched_maturity_indicators_in_source: string[];
    owner: AssociatedContact;
    sale_id: string;
    share_id: string;
    source: string;
    source_from: string;
    user_has_access: boolean;
    already_denied: boolean;
    already_requested: boolean;
}

interface ChaptersAndTopics {
    points: string[];
    topic: string;
}

interface ExistingOpportunity {
    unique_id: number;
    title: string;
    summary: string;
    stage: string;
    source: Source[];
    sale_ids: string[];
    opportunity_reason: string;
    opportunity_passed: boolean;
    money: number;
    maturity_indicators_passed: string[];
    currency: string;
    confidence_score: number;
    confidence_description: string;
    chapters_and_topics: ChaptersAndTopics[];
    associated_contacts: AssociatedContact[];
}

export interface Opportunity {
    associated_contacts: AssociatedContact[];
    assignee: Assignee;
    contact_mailid: string;
    chapters_and_topics: ChaptersAndTopics[];
    confidence_description: string;
    confidence_score: number;
    configured_stages: ConfiguredStages[];
    created: string;
    currency: string;
    detailed_analysis: DetailedAnalysis;
    existing_opportunity: ExistingOpportunity[];
    expected_close_date: string;
    id: string;
    manual_merge: boolean;
    maturity_indicators_passed: string[];
    merged_from: any[];
    money: number;
    opportunity_passed: boolean;
    opportunity_reason: string;
    opportunity_verified: boolean;
    sales_ids: string[];
    source: Source[];
    stage: string;
    summary: string;
    title: string;
    type: string;
    unique_id: number;
    user_has_access: boolean;
    user_id: string;
}