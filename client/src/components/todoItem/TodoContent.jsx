import React from 'react';

import { motion as m } from 'framer-motion';

export default function TodoContent({ todo, children }) {
  return (
    <m.div
      className="p-4 sm:p-8 max-w-4xl mx-auto w-full relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-gray-900 rounded-lg p-6 sm:p-8 relative shadow-lg border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {todo.title}
          </h1>
          {children && <div className="shrink-0">{children}</div>}
        </div>

        <div className="space-y-6">
          {todo.description && (
            <p className="leading-relaxed text-gray-300">{todo.description}</p>
          )}

          {todo.notes && (
            <div className="bg-gray-800 rounded-lg p-5 sm:p-6 border border-gray-700/40">
              <p className="max-w-none leading-relaxed text-gray-200 whitespace-pre-line">
                {todo.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
}
