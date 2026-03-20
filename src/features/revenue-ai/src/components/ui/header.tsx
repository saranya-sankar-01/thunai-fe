import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from 'react';
import { SidebarTrigger } from './sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from './dropdown-menu';
import { Input } from "./input";

export const projects = [
    "entrans",
    "QA Team",
    "Slack Marketplace",
    "Demo Santhosh",
    "test",
    "CTO Conference",
    "Enewate",
    "Amazon Connect",
    "Teams Phone",
    "Client Connect",
    "QA Test",
    "Chatbot Test",
];



const Header: React.FC = () => {
    const navigate = useNavigate();
    return (
        <header className='h-14 flex items-center justify-between border-b bg-white px-4'>
            <SidebarTrigger className='mr-4' />
            <div className="flex items-center space-x-2">
                <div className='flex items-center px-3 py-1.5 mr-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full shadow-sm'>
                    <span className='text-sm font-medium text-primary'>entrans</span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className='px-1.5 py-1 md:px-3 md:py-2 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all mr-1'>
                            <Bell />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuContent align='end' className='w-full bg-white rounded-lg border border-gray-200 shadow-sm w-[210px] xs:w-[250px] xm:w-[290px] md:w-[320px] lg:w-[470px]'>
                            <div className='p-4 border-b border-gray-200'>
                                <h2 className='text-gray-900 font-semibold text-base leading-6'>All Notifications</h2>
                            </div>
                            <div className='flex items-center justify-between px-6 py-3 border-b border-gray-200'>
                                <div className='flex space-x-3 items-center'>
                                    <button className='text-xs font-medium text-gray-700 rounded-md px-3 py-1 bg-[#F5F5F5]'>Unread (0)</button>
                                    <button className='text-xs font-medium text-gray-900 rounded-md px-3 py-1'>All</button>
                                </div>
                            </div>
                            <ul className='divide-y divide-gray-200 pb-2 max-h-[400px] overflow-y-auto ng-star-inserted'>

                            </ul>
                            <div className='flex flex-col items-center py-8 ng-star-inserted'>
                                <p className='text-gray-600 text-sm'>No unread notifications found.</p>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenuPortal>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className='px-1.5 py-1 md:p-2 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all mr-1'>
                            <User />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuContent align='end' className='bg-white w-[200px]'>
                            <DropdownMenuItem className='w-full px-3 py-2 hover:bg-gray-100 transition-all'>
                                <div className='h-[50px] flex flex-row items-center gap-2'>
                                    <span className='w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-medium'>E</span>
                                    <p className='text-sm text-gray-900'>Entrans</p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="cursor-pointer">
                                    entrans
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent className='px-2 py-1 overflow-auto bg-white' sideOffset={5} alignOffset={0}>
                                        <Input type="text" placeholder='Search Project' className="mb-4" />
                                        {projects.map(project => (
                                            <DropdownMenuRadioGroup key={project}>
                                                <DropdownMenuRadioItem value={project} className="cursor-pointer">
                                                    {project}
                                                </DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings/projects")}>
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                Change Password
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <p className='text-sm text-red-700'>Logout</p>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenuPortal>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default Header;