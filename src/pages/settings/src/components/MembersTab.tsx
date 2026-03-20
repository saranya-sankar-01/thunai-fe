import React, { useEffect } from 'react'
import { Users } from 'lucide-react';
import { useUserStore } from '../store/userStore'
import { getColor } from '../lib/utils';

type MembersTabProps = {
    role: string
}

const MembersTab: React.FC<MembersTabProps> = ({ role }) => {
    const { loadUsers, usersLoading, users } = useUserStore();

    useEffect(() => {
        const filters = {
            filter: [{ key_name: "role", key_value: role, operator: "==" }]
        }
        loadUsers(filters)
    }, [loadUsers, role])

    // useEffect(() => {
    //     if (!loaderRef.current || !containerRef.current) return;

    //     const observer = new IntersectionObserver(entries => {
    //         const target = entries[0];
    //         if (target.isIntersecting && !usersLoading) {
    //             if (currentPage < totalPages) {
    //                 setCurrentPage(currentPage + 1);
    //                 loadUsers({
    //                     filter: [{ key_name: "role", key_value: "Super Admin", operator: "==" }],
    //                     page: currentPage + 1
    //                 })
    //             }
    //         }
    //     }, {
    //         root: containerRef.current,
    //         threshold: 0.2
    //     });

    //     observer.observe(loaderRef.current);
    //     return ()=>observer.disconnect();
    // }, [currentPage, usersLoading, totalPages, loadUsers, setCurrentPage])

    if (usersLoading) return (
        <div className="flex justify-center items-center h-[400px]">
            <div
                className="w-10 h-10 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent">
            </div>
            <span className="ml-3 text-gray-600">Loading members...</span>
        </div>
    )

    if (users.length === 0 && !usersLoading) return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Users />
            <p className="text-lg">No members found</p>
        </div>
    )

    return (
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {users.map(user => (
                <div className="flex w-full py-3 items-center hover:bg-gray-50 rounded-lg transition-colors" key={user.user_id}>
                    <div className="flex items-center w-full">
                        <div
                            className="w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold mr-3 shadow-sm"
                            style={{ backgroundColor: getColor(user.username) }}
                        >
                            {user.username.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex flex-col flex-grow min-w-0">
                            <div className="text-gray-800 font-medium truncate">
                                {user.username}
                            </div>
                            <div className="text-gray-500 text-sm truncate">
                                {user.emailid}
                            </div>
                        </div>
                    </div>
                </div>
            ))}


            <div className="flex justify-center items-center py-4" >
                {usersLoading &&
                    <>
                        <div
                            className="w-6 h-6 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent">
                        </div>
                        <span className="ml-2 text-gray-600">Loading more users...</span>
                    </>
                }
            </div>
        </div>
    )
}

export default MembersTab