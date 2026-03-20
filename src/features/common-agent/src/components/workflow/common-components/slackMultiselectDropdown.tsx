import React, { useState, useRef, useEffect } from 'react';

const MultiSelectDropdown = ({ config = [], value = [], setValue, configLoading = false, error = null, text = "Select projects..", userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  // const filteredConfig = config?.filter(app => 
  //   app.name?.toLowerCase().includes(searchTerm?.toLowerCase())
  // );
const filteredConfig = Array.isArray(config)
  ? config.filter(app =>
      app.name?.toLowerCase().includes(searchTerm?.toLowerCase())
    )
  : [];

  // Handle checkbox selection for item (based on both channel_id and user_id)
  const handleItemToggle = (itemId) => {
    // Check if the item already exists in the selected values
    const newValue = [...value];
    const itemIndex = newValue.findIndex(item => item?.channel_id === itemId?.channel_id && item?.user_id === userId);
    
    if (itemIndex !== -1) {
      // If the item exists, remove it
      newValue.splice(itemIndex, 1);
    } else {
      // If it doesn't exist, add it (assuming `userId` is available in the parent scope)
      newValue.push({
        channel_id: itemId?.channel_id,
        user_id: userId,
      });
    }

    setValue(newValue); // Set the new value
  };

  // Get selected items for display
  const getSelectedItems = () => {
     if (!Array.isArray(config)) return [];
    return config?.filter(app => value.some(item => item?.channel_id === app.id && item?.user_id === userId));
  };

  // Remove individual tag (check both channel_id and user_id)
  const removeTag = (item: any, e: any) => {
    e.stopPropagation();
    // Filter the value array by matching both channel_id and user_id, remove the item
    const newValue = value.filter(existingItem => existingItem?.channel_id !== item?.channel_id && existingItem?.user_id !== userId);
    setValue(newValue);  // Update the value state with the filtered array
  };

  // Clear all selections
  const clearAll = (e) => {
    e.stopPropagation();
    setValue([]);
  };

  const selectedItems = getSelectedItems();

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Configure
      </label>
      
      {/* Main Dropdown Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full min-h-[42px] px-3 py-2 border rounded-lg cursor-pointer bg-white transition-all duration-200 ${isOpen ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-wrap gap-1">
            {selectedItems.length === 0 ? (
              <span className="text-gray-500 text-sm py-0.5">{text}</span>
            ) : (
              <>
                {selectedItems.slice(0, 2).map((item) => (
                  <span key={item.id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    {item.name}
                    <button onClick={(e) => removeTag(item, e)} className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {selectedItems.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                    +{selectedItems.length - 2} more
                  </span>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {selectedItems.length > 0 && (
              <button onClick={clearAll} className="text-gray-400 hover:text-gray-600 transition-colors" title="Clear all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                className="w-full text-black pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {configLoading ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                <div className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              </div>
            ) : error ? (
              <div className="px-3 py-4 text-center text-sm text-red-500">
                Error loading configuration
              </div>
            ) : filteredConfig.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                {searchTerm ? 'No matching projects found' : 'No projects available'}
              </div>
            ) : (
              filteredConfig.map((app) => (
                <label key={app.id} className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={value.some(item => item?.channel_id === app.id && item?.user_id === userId)} // Check based on both `channel_id` and `user_id`
                    onChange={() => handleItemToggle({ channel_id: app.id, user_id: userId })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700">{app.name}</span>
                </label>
              ))
            )}
          </div>

          {/* Footer */}
          {selectedItems.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-600">
              {selectedItems.length} project{selectedItems.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;