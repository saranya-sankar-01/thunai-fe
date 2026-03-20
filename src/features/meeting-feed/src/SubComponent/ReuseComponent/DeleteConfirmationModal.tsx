import React from "react";
// import DeleteIcon from "../../assets/svg/DeleteBlack.svg";
import DeleteWhite from "../../assets/svg/DeleteWhite.svg";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  loading?: boolean; 
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = "Delete",
  message = "Are you sure you want to delete this item?",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg  text-start">

        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-5">{message}</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2
      bg-red-500 text-white 
      px-4 py-2 rounded-[10px] 
      hover:bg-red-600
      text-sm font-medium
      transition-colors
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:pointer-events-none "
          >
             <img src={DeleteWhite} alt="" />
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Delete
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center gap-2
      bg-gray-100 text-gray-800 
      px-4 py-2 rounded-[10px] 
      hover:bg-gray-200
      text-sm font-medium
      transition-colors
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
