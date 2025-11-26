const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-6">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-md transition-colors
          ${
            currentPage === 1
              ? 'bg-gray-700 text-gray-500 dark:bg-gray-300 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300'
          }
        `}
      >
        Prev
      </button>

      <span className="text-sm text-gray-400 dark:text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-md transition-colors
          ${
            currentPage === totalPages
              ? 'bg-gray-700 text-gray-500 dark:bg-gray-300 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300'
          }
        `}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
