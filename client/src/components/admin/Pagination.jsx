const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-6 transition-colors duration-500">
      {/* Prev Button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`px-5 py-2 rounded-md font-medium transition-all duration-300 shadow-sm
          ${
            page === 1
              ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-400 dark:text-gray-900 dark:hover:bg-blue-300'
          }`}
      >
        Prev
      </button>

      {/* Page Info */}
      <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
        Page{' '}
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {page}
        </span>{' '}
        of {totalPages}
      </span>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`px-5 py-2 rounded-md font-medium transition-all duration-300 shadow-sm
          ${
            page === totalPages
              ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-400 dark:text-gray-900 dark:hover:bg-blue-300'
          }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
