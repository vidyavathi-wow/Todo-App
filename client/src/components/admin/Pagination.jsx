const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-6 transition-colors duration-500">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`px-4 py-2 rounded-md font-medium transition-all duration-300
          ${
            page === 1
              ? 'bg-gray-600 dark:bg-gray-300 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gray-dark dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-primary/80 dark:hover:bg-primary/70'
          }`}
      >
        Prev
      </button>

      <span className="text-sm text-gray-300 dark:text-gray-700">
        Page <span className="font-semibold text-primary">{page}</span> of{' '}
        {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`px-4 py-2 rounded-md font-medium transition-all duration-300
          ${
            page === totalPages
              ? 'bg-gray-600 dark:bg-gray-300 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gray-dark dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-primary/80 dark:hover:bg-primary/70'
          }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
