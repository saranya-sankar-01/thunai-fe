import React from 'react'

type PermissionCardProps = {
    permission: {
        key: string,
        name: string,
        description: string,
        displayName: string,
    };
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}

const PermissionCard: React.FC<PermissionCardProps> = ({ permission, value, onChange, readOnly }) => {
    // console.log(permission, value);
    return (
        <div
            className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="w-3/5">
                <p className="text-md font-semibold text-gray-800">{permission.displayName}</p>
                <p className="text-gray-500 text-sm mt-1">{permission.description}</p>
            </div>
            <div className="w-2/5 pl-4">
                <select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={readOnly}
                    className="border rounded-md p-2.5 w-full max-w-xs text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                    <option value="">No Access</option>
                    <option value="READ">Read</option>
                    <option value="ALL">All</option>
                </select>
            </div>
        </div>
    )
}

export default PermissionCard