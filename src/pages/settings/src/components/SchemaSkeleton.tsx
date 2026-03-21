import React from 'react'

const SchemaSkeleton: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="animate-pulse">

                <div className="bg-white rounded-xl sm:rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                            <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-1/2 sm:w-1/3 mb-3 sm:mb-4"></div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="hidden sm:block w-1 h-1 bg-gray-200 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                            <div className="h-8 sm:h-10 bg-gray-200 rounded-full w-24 sm:w-32"></div>
                            <div className="h-10 sm:h-12 bg-gray-200 rounded-lg sm:rounded-xl w-32 sm:w-40"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    <div className="bg-white rounded-xl sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100">
                            <div className="h-5 sm:h-6 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(item => (
                                    <div key={item} className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-200 rounded-lg sm:rounded-xl flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gray-200 rounded-lg sm:rounded-xl"></div>
                                            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gray-200 rounded-lg sm:rounded-xl"></div>
                                            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gray-200 rounded-lg sm:rounded-xl"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100">
                            <div className="h-5 sm:h-6 bg-gray-200 rounded w-36"></div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="text-center py-8 sm:py-16">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gray-200 rounded-full"></div>
                                <div className="h-4 sm:h-5 bg-gray-200 rounded w-40 sm:w-48 mx-auto mb-2"></div>
                                <div className="h-3 sm:h-4 bg-gray-200 rounded w-56 sm:w-64 mx-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed sm:static bottom-0 left-0 right-0 bg-white sm:bg-transparent border-t sm:border-t-0 border-gray-200 px-4 py-3 sm:px-0 sm:py-0 sm:mt-8 z-10">
                    <div className="h-12 sm:h-14 bg-gray-200 rounded-lg sm:rounded-2xl w-full sm:w-52"></div>
                </div>
            </div>
        </div>
    )
}

export default SchemaSkeleton