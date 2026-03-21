import React from 'react'

type SubscriptionUsageProps = {
    icon: string;
    title: string;
    subtitle: string;
    usage: number | string;
    total: number | string;
    iconBg: string;
    usageBarBg: string;
}

const SubscriptionUsage: React.FC<SubscriptionUsageProps> = ({ icon, iconBg, usageBarBg, title, subtitle, usage, total }) => {
    return (
        <div className="rounded-xl flex flex-col">
            <div className="mb-2">
                <div className="flex flex-col md:flex-row md:items-center space-x-4 flex-1 min-w-0">
                    <div className={`${iconBg} rounded-lg p-3 flex-shrink-0`}>
                        <img src={icon} alt={title} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 font-semibold text-base">{title}</h3>
                    </div>
                    <span className="text-base font-semibold text-gray-900 ml-4 whitespace-nowrap">
                        {usage.toLocaleString(undefined, {
                            minimumIntegerDigits: 1,
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                        })} / {total || title === "Credits Usage" ? ' ' : "∞"}
                    </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-auto">
                <div
                    className={`h-2 ${usageBarBg} rounded-full transition-all duration-300`}
                    style={{ width: (+usage / +total) * 100 + '%' }}
                ></div>
            </div>
        </div>
    )
}

export default SubscriptionUsage