import React from 'react'
interface ConfirmDisconnectProps {
    title: string
    content: string
    onCloseModal?: () => void
    onConfirm: () => void
}
const ConfirmDisconnect: React.FC<ConfirmDisconnectProps> = ({ title, content, onCloseModal, onConfirm }) => {
    return (
        <div className='flex flex-col gap-1 p-4'>
            <h2 className='text-lg font-medium text-gray-800 mb-4'>{title}</h2>
            <p className='text-sm text-gray-600 mb-6 max-h-48 overflow-y-auto break-words whitespace-pre-wrap'>{content}</p>
            <div className='flex justify-end space-x-4'>
                <button className='px-6 py-3 text-sm text-white bg-[#4056F4] rounded-md shadow-md -700 transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ng-star-inserted cursor-pointer' onClick={() => onConfirm()}>Confirm</button>
                <button className='px-6 py-3 text-sm text-gray-700 bg-gray-200 rounded-md shadow-md hover:bg-gray-300 transition duration-200 ng-star-inserted cursor-pointer' onClick={() => onCloseModal?.()}>Cancel</button>
            </div>
        </div>
    )
}

export default ConfirmDisconnect