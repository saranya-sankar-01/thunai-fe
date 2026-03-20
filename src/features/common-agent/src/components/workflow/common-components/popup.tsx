export default function ConfirmationModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div
        className="bg-gray-900 rounded-lg p-6 max-w-sm w-full shadow-lg"
        style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.7)" }}
      >
        <h2 className="text-white font-bold text-lg mb-3">
          Are you absolutely sure?
        </h2>
        <p className="mb-6 text-white whitespace-pre-line font-normal text-sm">
          {message}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded bg-black text-white hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
          >
            Yes, Reset Flow
          </button>
        </div>
      </div>
    </div>
  );
}
