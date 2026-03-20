import React from 'react';

import DocAlertIcon from "../assets/images/docAlert.svg";
import SuccessIcon from "../assets/images/success-tick.svg";
import { cn } from "@/lib/utils";

type RetainCardButtonProps = {
    active: boolean;
    title: string;
    content: string;
    handleClick: () => void;
    apiSuccess: boolean;
    disabled?: boolean;
}

const RetainCardButton: React.FC<RetainCardButtonProps> = ({ active, apiSuccess, title, content, handleClick, disabled }) => {
    return (
        <button
            className={cn("w-full max-w-md flex items-center space-x-4  justify-between border border-gray-300 rounded-md p-4 mb-4 hover:shadow-sm", active ? "border-gray-700 bg-gray-50" : "border-gray-300")}
            type="button" onClick={handleClick} disabled={disabled}>
            <div className="text-left">
                <p className="font-semibold text-sm text-gray-900 mb-1">{title}</p>
                <p className="text-xs text-gray-500">{content}</p>
            </div>
            <div aria-hidden="true" className="p-1 rounded-full bg-red-50 flex items-center justify-center">
                <img src={DocAlertIcon} alt="DocAlert" />
            </div>
            {apiSuccess &&
                <div aria-hidden="true" className="p-1 rounded-full bg-green-50 flex items-center justify-center">
                    <img src={SuccessIcon} alt="Success" />
                </div>
            }
        </button>
    )
}

export default RetainCardButton