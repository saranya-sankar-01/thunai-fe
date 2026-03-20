import React, { useState, useRef, useEffect } from 'react';

const GoogleDriveMultiSelectDropdown = ({
  selectedApp,
  application_name,
  value = [],
  setValue,
  configLoading = false,
  error = null,
  text = "Select Accounts.."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
const [folderName, setFolderName] = useState(
  value.length > 0 ? value[0]?.folder_name : ''
);
  const dropdownRef = useRef(null);

  const oauthTokens = selectedApp?.oauth_token_application_ids || [];

  // Close dropdown on outside click
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

  // Filter based on search
  const filteredTokens = oauthTokens.filter(token =>
    token?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token?.application_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle selection
  const handleItemToggle = (token) => {
    const exists = value.some(v => v?.application_id === token.application_id);
    let newSelection;
    if (exists) {
      newSelection = value.filter(v => v?.application_id !== token.application_id);
    } else {
      newSelection = [
        ...value,
        {
          application_id: token.application_id,
          user_id: token.user_id || "",
          email_id: token.email || "",
          folder_name: folderName
        }
      ];
    }
    setValue(newSelection);
  };

  // Handle select all
  const toggleSelectAll = (checked) => {
    if (checked) {
      const allItems = filteredTokens.map(token => ({
        application_id: token.application_id,
        user_id: token.user_id || "",
        email_id: token.email || "",
        folder_name: folderName
      }));
      const allIds = value.map(v => v?.application_id);
      const merged = [
        ...value,
        ...allItems.filter(item => !allIds.includes(item?.application_id))
      ];
      setValue(merged);
    } else {
      const idsToRemove = filteredTokens.map(token => token.application_id);
      setValue(value.filter(v => !idsToRemove.includes(v?.application_id)));
    }
  };

 const handlePathChange = (e) => {
  const newFolderName = e.target.value;
  setFolderName(newFolderName);

  const updated = value.map(item => ({
    ...item,
    folder_name: newFolderName
  }));

  setValue(updated);
};


  // Remove single tag
  const removeTag = (id, e) => {
    e.stopPropagation();
    setValue(value.filter(v => v?.application_id !== id));
  };

  const selectedItems = oauthTokens.filter(token =>
    value.some(v => v?.application_id === token?.application_id)
  );

  return (
    <div>
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Configure
        </label>

        {/* Main Dropdown */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-full min-h-[42px] px-3 py-2 border rounded-lg cursor-pointer bg-white transition-all duration-200 ${
            isOpen
              ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 flex flex-wrap gap-1">
              {selectedItems.length === 0 ? (
                <span className="text-gray-500 text-sm py-0.5">{text}</span>
              ) : (
                <>
                  {selectedItems.slice(0, 2).map((item) => (
                    <span
                      key={item.application_id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                    >
                      {item.email}
                      <button
                        onClick={(e) => removeTag(item.application_id, e)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
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
                <button
                  onClick={(e) => { e.stopPropagation(); setValue([]); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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

            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {configLoading ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500">Loading...</div>
              ) : error ? (
                <div className="px-3 py-4 text-center text-sm text-red-500">Error loading data</div>
              ) : filteredTokens.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'No matches found' : 'No tokens available'}
                </div>
              ) : (
                <>
                  {filteredTokens.length > 1 && (
                    <div className="border-b border-gray-100">
                      <label className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={filteredTokens.every(token =>
                            value.some(v => v?.application_id === token?.application_id)
                          )}
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          Select All ({filteredTokens.length})
                        </span>
                      </label>
                    </div>
                  )}
                  {filteredTokens.map((token) => (
                    <label
                      key={token.application_id}
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={value.some(v => v?.application_id === token?.application_id)}
                        onChange={() => handleItemToggle(token)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">{token.email}</span>
                    </label>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Path Input */}
      {application_name === 'google drive' && (
        <div className="">
            <label className="block text-sm font-semibold text-gray-700 mb-1 mt-3 flex items-center gap-1">
            path
                <div className="relative group">
                    <svg
                    className="w-4 h-4 text-gray-400 cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                    />
                    </svg>
                    {/* Tooltip */}
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-56 px-3 py-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        A folder will be created with the name you enter in the path field.
                    </div>
                </div>
          </label>
          <input
            type="text"
            placeholder="Enter path (slashes '/' not allowed)"
            className="w-full text-black mt-1 pl-2 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            value={folderName}
             onChange={handlePathChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default GoogleDriveMultiSelectDropdown;