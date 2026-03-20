import React from 'react'
import { cn } from '@/lib/utils'

type UserStatusBadgeProps = {
    status: string
}
const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
    return (
        <div className="break-words">
            <span className={cn("px-1.5 py-0.5 md:px-3 md:py-1 rounded-full text-black text-xs md:text-sm", status === "Active" && "bg-green-100 text-green-700", status === "InActive" && "bg-red-100 text-red-700", status === "Onboarded" && "bg-orange-100 text-orange-700")}>{status}</span>
        </div>
    )
}

export default UserStatusBadge