import { useState } from 'react';
import Add2 from "../../assets/svg/Add2.svg";

interface Tag {
  tag: string; 
  description: string; 
}

interface TagsProps {
  tags: Tag[];
  mode?: "view" | "edit"; 
  onAddTag: (tag: string, description: string) => void;
  onRemoveTag: (index: number) => void;
}

const Tags = ({ tags, onAddTag, onRemoveTag, mode }: TagsProps) => {
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");

  const handleAddTag = () => {
    if (tag.trim() === "") return;
    
    // Ensure we're sending proper data structure
    onAddTag(tag.trim(), description.trim());
    setTag("");
    setDescription("");
  };

  // Filter out empty objects and validate data
  const validTags = tags.filter(tagObj => 
    tagObj && typeof tagObj === 'object' && tagObj.tag
  );


  return (
    <div className="p-6 bg-gray-50 h-[calc(100vh-200px)] overflow-y-scroll scrollbar-thin">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Call Analysis</h2>

      <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-indigo-600"></span> Add New Tag
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tag Name *</label>
            <input
              type="text"
              placeholder="Enter tag"
              value={tag}
              disabled={mode === "view"}
              onChange={(e) => setTag(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Instruction
            </label>
            <input
              type="text"
              placeholder="Enter instruction"
              value={description}
              disabled={mode === "view"}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end">

        <button
          onClick={handleAddTag}
          disabled={mode === "view"}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition flex justify-end gap-2"
        >
          <img src={Add2} alt="" /> Add Tag
        </button>
        </div>

      </div>

      <div className="bg-white shadow-md rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-blue-600"></span> Existing Tags
        </h3>

        {validTags.length === 0 ? (
          <p className="text-gray-500 text-sm">No tags added yet.</p>
        ) : (
          <ul className="space-y-3">
            {validTags.map((tagObj, index) => (
              <li
                key={index}
                className="flex justify-between items-center border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div>
                  <div className="font-medium text-gray-800">{tagObj.tag}</div>
                  {tagObj.description && (
                    <div className="text-sm text-gray-600">{tagObj.description}</div>
                  )}
                </div>
                <button
                  onClick={() => onRemoveTag(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Tags;