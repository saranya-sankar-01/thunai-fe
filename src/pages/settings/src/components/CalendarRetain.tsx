import React from 'react'
import { useSubscriptionStore } from "../store/subscriptionStore";

import DowngradeIcon from "../assets/images/downgrade.svg";

type CalendarRetainProps = {
    activeTab: string;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const CalendarRetain: React.FC<CalendarRetainProps> = ({ activeTab, setOpenDialog }) => {
    const { matchedPlan } = useSubscriptionStore();
    return (
        <div className="flex-1 bg-gray-50 p-8 rounded-r-lg flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-gray-900 font-semibold text-lg capitalize">
                    Retain {activeTab}
                </h3>
            </div>
            <div className="flex justify-center mb-6">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                    <img src={DowngradeIcon} alt="Downgrade" className="w-15 h-15" />
                </div>
            </div>

            <h2 className="text-center text-lg font-semibold text-gray-900 mb-2">
                Calendar Account Limit Reached
            </h2>

            <p className="text-center text-sm text-gray-700 mb-6 px-6">
                As you move to the
                <strong> {matchedPlan?.name || 'Free'}</strong> Plan. Please choose which calendars to
                Retain.
            </p>
        </div>
    )
}

export default CalendarRetain;
