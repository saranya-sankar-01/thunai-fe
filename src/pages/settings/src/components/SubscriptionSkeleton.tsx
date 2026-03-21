import React from 'react'

const SubscriptionSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div className="mb-4 sm:mb-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <div className="h-7 bg-gray-200 rounded w-40"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="text-center">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded-full"></div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded-full"></div>
                </div>
            </div>
        </div>
    )
}

export default SubscriptionSkeleton