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
    <div className="bg-gray border border-gray-light rounded-lg p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search todo"
          noDefault
          className="flex-1 px-4 py-2 rounded-lg bg-gray-dark border border-gray-light text-gray-light focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Button
          onClick={handleSearch}
          noDefault
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80 transition"
        >
          Search
        </Button>
      </div>
    </div>
  );
}
