import { cn } from '@/lib/utils'
import React from 'react'

type UserTabButtonProps = {
    title: string;
    selected: string;
    onClick: React.Dispatch<React.SetStateAction<string>>;
    source?: string;
    alt?: string
}

const UserTabButton: React.FC<UserTabButtonProps> = ({ title, selected, onClick, source, alt }) => {
    return (
        <div className='flex gap-3'>
            <button className={cn("flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm font-medium hover:bg-gray-100 hover:text-gray-900", title === selected && "border-gray-800")} onClick={() => onClick(title)}>
                {source && <img src={source} alt={alt} className="w-5 h-5" />}
                {title}
            </button>
        </div>
    )
}

export default UserTabButton