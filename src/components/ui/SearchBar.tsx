import React, { ChangeEvent } from 'react'
import { Search } from 'lucide-react'

interface SearchbarProps {
    type: string
    placeholder: string
    value: string
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchbarProps> = ({ type = "text", placeholder = "Search", value, onChange }) => {
    return (
        <div className='flex items-center px-4 py-3 bg-gray-100 rounded-lg shadow-sm'>
            <Search className='w-4 h-4 mr-1 text-gray-400' />
            <input className='bg-transparent text-md ml-1 text-gray-600 placeholder-gray-500 align-middle w-full focus:outline-none focus:ring-0' type={type} placeholder={placeholder} value={value} onChange={onChange} />
        </div>
    )
}

export default SearchBar