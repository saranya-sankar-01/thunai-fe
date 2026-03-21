import { ApplicationItem } from '../types/ApplicationItem'
import { CircularProgress } from '@mui/material'
import React from 'react'
interface BottomConfigureBarProps {
    application: ApplicationItem
    onClose: (close: boolean)=>void
    isSavingDisabled: boolean
    isSaving: boolean
    commonSave: () => Promise<void>
    success: boolean
    shake: boolean
}
const BottomConfigureBar: React.FC<BottomConfigureBarProps> = ({ application, onClose, isSavingDisabled, isSaving, commonSave, success, shake }) => {
    return (
        <div className={`fixed bottom-2 flex flex-col z-50 sm:flex-row items-center justify-between w-full sm:w-1/2 p-4 bg-white border border-gray-300 rounded-xl shadow-lg ${shake ? "animate-shake" : ""}`}>
            <span className="text-gray-700 text-center sm:text-left">You have unsaved changes</span>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <button className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition" onClick={()=> onClose(false)}>
                    Cancel
                </button>
                <button disabled={isSavingDisabled} className="w-full sm:w-auto disabled:cursor-not-allowed px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-primaryHover transition" onClick={()=>commonSave()}>
                    {!isSaving && <span className="text-sm text-gray-0">{application.action_application_id || application.is_connected ? 'Save' : 'Configure'}</span>}
                    {isSaving &&
                        <span className={`w-full flex items-center`}>
                            <CircularProgress size={20}></CircularProgress>
                            <span className="ml-2">Loading...</span>
                        </span>
                    }
                </button>

                {/* <!-- Success icon and text shown after the save is successful --> */}
                {success &&
                    <div className="flex items-center space-x-2 text-green-500 transition-opacity duration-500 ease-in-out opacity-100 animate-fade-in">
                        <span className="material-icons">check_circle</span>
                        <span>Success</span>
                    </div>
                }
            </div >
        </div >
    )
}

export default BottomConfigureBar