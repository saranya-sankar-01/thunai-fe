import React from 'react'

const SubscriptionPlanSkeleton: React.FC = () => {
    return (
        <div className="flex min-w-full px-4">
            {[1, 2, 3, 4].map(item => (
                <div key={item} className="animate-pulse bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full mx-2">
                    <div className="relative">
                        <div className="p-6 bg-gradient-to-r from-gray-200 to-gray-300">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-gray-300"></div>
                            </div>
                            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
                        <div className="space-y-3 mb-6">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            ))}
        </div >
    )
}

export default SubscriptionPlanSkeleton