import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

export default function SearchTodo({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => onSearch(query);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="bg-gray dark:bg-gray-100 border border-gray-light dark:border-gray-300 rounded-lg p-4 mb-4 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search todo"
          noDefault
          className="flex-1 px-4 py-2 rounded-lg bg-gray-dark dark:bg-white border border-gray-light dark:border-gray-300 text-gray-light dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-300"
        />
        <Button
          onClick={handleSearch}
          noDefault
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80 transition-colors duration-300"
        >
          Search
        </Button>
      </div>
    </div>
  );
}
