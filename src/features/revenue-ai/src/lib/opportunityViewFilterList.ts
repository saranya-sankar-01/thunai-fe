import { FilterSchema } from "@/types/FilterTypes";

export const opportunityViewFilterList: FilterSchema[] = [
    { key_name: "title", label: "Opportunity name", inputtype: "textbox" as const },
    { key_name: "confidence_score", label: "Confidence Score", inputtype: "textbox" as const },
    { key_name: "stage", label: "Stage", inputtype: "select" as const, rowData: ["Discovery", "Qualification", "Proposal", "Negotiation", "Closed-won"] },
    {
        key_name: "maturity_indicators_passed",
        label: "Indicators",
        inputtype: "multiselect" as const,
        rowData: ["Budget discussed or confirmed", "Timeline mentioned", "Decision maker identified", "Technical requirements discussed", "Competitive alternatives mentioned", "Implementation timeline discussed"],
    },
    { key_name: "assignee", label: "Assignee", inputtype: "select" as const },
    { key_name: "created", label: "Created On", inputtype: "date" as const },
];