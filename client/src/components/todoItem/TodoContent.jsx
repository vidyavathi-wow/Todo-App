import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
// eslint-disable-next-line no-unused-vars
import { motion as m } from "framer-motion";

export default function TodoContent({ todo, children }) {
  const notesRef = useRef(null);

  useEffect(() => {
    if (todo.notes && notesRef.current) {
      try {
        const parsed = JSON.parse(todo.notes);
        if (parsed && parsed.ops) {
          const tempQuill = new Quill(document.createElement("div"));
          tempQuill.setContents(parsed);
          notesRef.current.innerHTML = tempQuill.root.innerHTML;
        } else {
          notesRef.current.innerHTML = todo.notes;
        }
      } catch {
        notesRef.current.innerHTML = todo.notes;
      }
    }
  }, [todo.notes]);

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
            <p className="leading-relaxed text-gray-300">
              {todo.description}
            </p>
          )}

          {todo.notes && (
            <div className="bg-gray-800 rounded-lg p-5 sm:p-6 border border-gray-700/40">
              <div
                ref={notesRef}
                className="prose prose-invert max-w-none leading-relaxed text-gray-200"
              />
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
}
