import React, { ReactNode } from 'react'
interface PageTitleProps {
    title: string,
    content?: string,
    children?: ReactNode
};

const PageTitle: React.FC<PageTitleProps> = ({ title, content, children }) => {
    return (
        <div className='flex flex-col justify-between space-y-3 mb-2 lg:flex-row lg:items-center lg:space-x-3 sm:space-y-0 lg:mb-6'>
            <div>
                <h1 className='text-l font-semibold text-gray-900 mb-1 lg:text-2xl'>{title}</h1>
                {content && <p className='text-gray-600 text-xs lg:text-sm mb-2 lg:mb-3'>{content}</p>}
            </div>
            {children}
        </div>
    )
}

export default PageTitle