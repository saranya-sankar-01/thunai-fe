export interface CustomField {
    name: string;
    type: string;
    required: boolean;
    description: string;
    example: string;
    key: string;
    options?: string[];
    placeholder: string;
    isDefault?: boolean
}