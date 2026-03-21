import { type ChangeEvent } from "react";

interface SearchbarProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type: string;
}

const Searchbar: React.FC<SearchbarProps> = ({
  type,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3 shadow-sm">
        <img src="/svg/search.svg" alt="search-icon" className="w-4 h-4 mr-2" />
        <input
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          className="bg-transparent text-sm text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-0 rounded-md w-full"
        />
      </div>
    </div>
  );
};

export default Searchbar;
