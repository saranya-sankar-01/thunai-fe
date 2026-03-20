import { cn } from '@/lib/utils';
import React from 'react';

interface ConfigurationTabProps {
  title: string;
  selectedTab: string
  onClick: React.Dispatch<React.SetStateAction<string>>
}

const ConfigurationTabButton: React.FC<ConfigurationTabProps> = ({ title, selectedTab, onClick }) => {
  return (
    <button className={cn("px-2 py-1 md:px-4 md:py-2 border border-gray-300 rounded-full text-xs md:text-sm hover:bg-gray-100 focus:outline-none", selectedTab === title && "bg-gray-200 border-1 border-gray-500")} onClick={() => onClick(title)}>{title}</button>
  )
}

export default ConfigurationTabButton