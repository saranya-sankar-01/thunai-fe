export const getOperatorList = (inputType: string): { value: string; label: string }[] => {
    switch (inputType) {
        case 'textbox':
            return [
                { value: 'like', label: 'contains' },
                { value: 'notlike', label: 'does not contain' },
                { value: '==', label: 'equal to' },
                { value: '!=', label: 'not equal to' }
            ];
        case 'number':
            return [
                { value: '==', label: 'equal to' },
                { value: '!=', label: 'not equal to' },
                { value: '>=', label: 'greater than or equal to' },
                { value: '<=', label: 'less than or equal to' }
            ];
        case 'date':
            return [{ value: 'like', label: 'between' }];
        case 'select':
            return [
                { value: '==', label: 'equal to' },
                { value: '!=', label: 'not equal to' }
            ];
        case 'multiselect':
            return [
                { value: 'in', label: 'equal to' },
                { value: 'notin', label: 'not equal to' }
            ];
        default:
            return [{ value: 'like', label: 'like' }];
    }
};

export const getDefaultOperator = (fieldName: string, inputType: string): string => {
    const fieldDefaults: Record<string, string> = {
        'title': 'like',           // contains
        'type': 'in',              // equal to
        'periodic_synced': '==',   // equal to
        'status': 'in',            // equal to
        'created_on': 'like',      // between
        'added_type': 'in',        // equal to
        'file_name': 'like'        // contains
    };

    // Return field-specific default or fall back to input type default
    return fieldDefaults[fieldName.toLowerCase()] || getOperatorList(inputType)[0]?.value || 'like';
};