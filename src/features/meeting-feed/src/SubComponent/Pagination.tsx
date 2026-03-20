export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  
  const getPages = () => {
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Show dots before middle section
    if (currentPage > 3) {
      pages.push("...");
    }

    // Middle section: current-1, current, current+1
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let p = start; p <= end; p++) {
      pages.push(p);
    }

    // Show dots after middle section
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex sticky bottom-0 w-full items-end justify-center gap-3 bg-white pt-2 text-sm">
      
      {/* Previous */}
      <button
        onClick={() => currentPage !== 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-1 ${
          currentPage === 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-600 hover:text-black"
        }`}
      >
        <span className="text-lg">‹</span>
        Previous
      </button>

      {/* Page Buttons */}
      {pages.map((p, index) =>
        p === "..." ? (
          <span key={index} className="text-gray-500">
            …
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(p as number)}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              currentPage === p
                ? "bg-blue-600 text-white"
                : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() =>
          currentPage !== totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className={`flex items-center gap-1 cursor-pointer ${
          currentPage === totalPages
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-600 hover:text-black"
        }`}
      >
        Next
        <span className="text-lg">›</span>
      </button>
    </div>
  );
};
