interface PaginationProps {
  productsCount : number
  page: number; // 1-based
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, onPageChange, productsCount }: PaginationProps) {


  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-3 sm:px-6">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>

      <span className="text-sm font-medium text-ink">
        Page {page}
      </span>

      <button
        type="button"
        className="btn-secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={ productsCount < 10}
      >
        Next
      </button>
    </div>
  );
}
