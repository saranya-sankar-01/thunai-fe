import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import React, { useCallback, useMemo } from "react";

interface AgentPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  pageSize?: number;
  totalItems?: number;
  onPageSizeChange?: (size: number) => void;
}

export function AgentPagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  totalItems = 0,
  onPageSizeChange,
}: AgentPaginationProps) {
  // Generate page numbers for display
  const getPageNumbers = useMemo(() => {
    const pageNumbers: number[] = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, currentPage + half);

    if (endPage - startPage + 1 < maxPagesToShow) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, maxPagesToShow);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }, [currentPage, totalPages]);

  const handleInternalPageChange = useCallback(
    (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        onPageChange(pageNumber);
      }
    },
    [totalPages, onPageChange]
  );

  if (totalPages <1) {
    return null; // Don't render pagination if there's only one page or less
  }

  const isShowingAll = totalItems > 0 && pageSize >= totalItems;

  return (
    <div className="fixed w-full bottom-0 bg-background py-2 border-t border-border mt-8">
      <div className="flex items-center justify-between px-6">
        {/* <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> - <span className="font-medium text-foreground">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-medium text-foreground">{totalItems}</span>
        </div> */}
           <div className="flex items-center gap-2">
        {!isShowingAll && onPageSizeChange && (
          <button
            onClick={() => onPageSizeChange(totalItems)}
            className="text-sm text-primary hover:underline font-medium transition-colors whitespace-nowrap"
          >
            Show All ({totalItems})
          </button>
        )}
        {isShowingAll && onPageSizeChange && (
          <button
            onClick={() => onPageSizeChange(10)}
            className="text-sm text-primary hover:underline font-medium transition-colors whitespace-nowrap"
          >
            Show Less
          </button>
        )}
      </div>
        <Pagination>
        <PaginationContent>
          {/* Previous button */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handleInternalPageChange(currentPage - 1);
              }}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50" // disabled style
                  : ""
              }
            />
          </PaginationItem>

          {/* Page numbers */}
          {getPageNumbers.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleInternalPageChange(pageNumber);
                }}
                isActive={pageNumber === currentPage}
                className={
    pageNumber === currentPage
      ? "bg-blue-500 text-white rounded-md" // selected page style
      : ""
  }
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Ellipsis */}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Next button */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages)
                  handleInternalPageChange(currentPage + 1);
              }}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50" // disabled style
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      </div>
    </div>
  );
}
