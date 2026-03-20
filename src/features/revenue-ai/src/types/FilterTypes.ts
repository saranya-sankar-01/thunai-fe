export interface FilterSchema {
    key_name: string;
    key_value?: string;
    operator?: string;
    label: string;
    inputtype: "textbox" | "select" | "multiselect" | "date" | "number";
    rowData?: any;
}

export interface FilterCondition {
    filterField: string;
    condition: string;
    filterValue: string | string[];
    keyvalue_to?: string;
}