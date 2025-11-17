// import { useNavigate } from 'react-router-dom';
// import { STATUS_COLORS } from '../../utils/Constants';

// export default function TodoCard({ todo, onToggleCompleted, currentUser }) {
//   const navigate = useNavigate();
//   const status = (todo.status || '').toLowerCase();
//   const isCompleted = status === 'completed';

//   // Only creator or assigned user can toggle
//   const canToggle =
//     todo.userId === currentUser.id || todo.assignedToUserId === currentUser.id;

//   const assigneeName =
//     todo?.assignee?.name ||
//     (todo?.assignedToUserId ? `User #${todo.assignedToUserId}` : 'Unassigned');

//   return (
//     <div
//       title={canToggle ? '' : 'You can only view this task'}
//       className={`relative bg-gray-900 dark:bg-white border border-gray-700 dark:border-gray-300 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
//         isCompleted ? 'opacity-70' : ''
//       }`}
//       onClick={() => navigate(`/todo/${todo.id}`)}
//     >
//       {/* HEADER */}
//       <div className="flex justify-between items-start mb-3">
//         <div className="flex items-center gap-3">
//           {/* SHOW CHECKBOX ONLY IF USER HAS PERMISSION */}
//           {canToggle && (
//             <input
//               type="checkbox"
//               checked={isCompleted}
//               onClick={(e) => e.stopPropagation()}
//               onChange={(e) => {
//                 e.stopPropagation();
//                 onToggleCompleted(todo);
//               }}
//               className="w-5 h-5 accent-green-500 cursor-pointer translate-y-[1px]"
//             />
//           )}

//           <h3
//             className={`text-primary text-lg font-semibold transition-colors duration-300 leading-tight ${
//               isCompleted
//                 ? 'line-through text-gray-500 dark:text-gray-400'
//                 : 'dark:text-gray-900 hover:text-blue-400 dark:hover:text-blue-600'
//             }`}
//           >
//             {todo.title}
//           </h3>
//         </div>

//         {/* STATUS TAG */}
//         <span
//           className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
//             STATUS_COLORS[status] ||
//             'bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700'
//           }`}
//         >
//           {todo.status}
//         </span>
//       </div>

//       {/* FOOTER */}
//       <div className="mt-3 flex flex-wrap justify-between items-center text-sm text-gray-400 dark:text-gray-600 gap-2">
//         <div className="flex flex-wrap items-center gap-3">
//           <span
//             className={`font-medium ${
//               todo.priority === 'High'
//                 ? 'text-red-400 dark:text-red-600'
//                 : todo.priority === 'Moderate'
//                   ? 'text-yellow-400 dark:text-yellow-600'
//                   : 'text-green-400 dark:text-green-600'
//             }`}
//           >
//             {todo.priority} Priority
//           </span>

//           {todo.date && (
//             <span className="text-gray-400 dark:text-gray-600">
//               📅 {new Date(todo.date).toLocaleDateString()}
//             </span>
//           )}
//         </div>

//         <p className="text-xs text-gray-500 dark:text-gray-700">
//           👤 {assigneeName}
//         </p>
//       </div>

//       {/* TOOLTIP (visible on hover when user cannot update) */}
//       {!canToggle && (
//         <div className="absolute top-2 right-2 text-[10px] bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
//           Read-only task
//         </div>
//       )}
//     </div>
//   );
// }

import { useNavigate } from 'react-router-dom';
import { STATUS_COLORS } from '../../utils/Constants';

export default function TodoCard({ todo, onToggleCompleted, currentUser }) {
  const navigate = useNavigate();

  if (!currentUser || !todo) return null; // prevent crashes

  // Safe values
  const userId = currentUser?.id;
  const status = (todo.status || '').toLowerCase();
  const isCompleted = status === 'completed';

  // Only creator or assigned user can toggle
  const canToggle =
    userId && (todo.userId === userId || todo.assignedToUserId === userId);

  const assigneeName =
    todo?.assignee?.name ||
    (todo?.assignedToUserId ? `User #${todo.assignedToUserId}` : 'Unassigned');

  return (
    <div
      title={canToggle ? '' : 'You can only view this task'}
      className={`relative group bg-gray-900 dark:bg-white border border-gray-700 dark:border-gray-300 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
        isCompleted ? 'opacity-70' : ''
      }`}
      onClick={() => navigate(`/todo/${todo.id}`)}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {/* SHOW CHECKBOX ONLY IF USER HAS PERMISSION */}
          {canToggle && (
            <input
              type="checkbox"
              checked={isCompleted}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onToggleCompleted(todo);
              }}
              className="w-5 h-5 accent-green-500 cursor-pointer translate-y-[1px]"
            />
          )}

          <h3
            className={`text-primary text-lg font-semibold transition-colors duration-300 leading-tight ${
              isCompleted
                ? 'line-through text-gray-500 dark:text-gray-400'
                : 'dark:text-gray-900 hover:text-blue-400 dark:hover:text-blue-600'
            }`}
          >
            {todo.title}
          </h3>
        </div>

        {/* STATUS TAG */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            STATUS_COLORS[status] ||
            'bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-700'
          }`}
        >
          {todo.status}
        </span>
      </div>

      {/* FOOTER */}
      <div className="mt-3 flex flex-wrap justify-between items-center text-sm text-gray-400 dark:text-gray-600 gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`font-medium ${
              todo.priority === 'High'
                ? 'text-red-400 dark:text-red-600'
                : todo.priority === 'Moderate'
                  ? 'text-yellow-400 dark:text-yellow-600'
                  : 'text-green-400 dark:text-green-600'
            }`}
          >
            {todo.priority} Priority
          </span>

          {todo.date && (
            <span className="text-gray-400 dark:text-gray-600">
              📅 {new Date(todo.date).toLocaleDateString()}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-700">
          👤 {assigneeName}
        </p>
      </div>

      {/* READ-ONLY TOOLTIP */}
      {!canToggle && (
        <div className="absolute top-2 right-2 text-[10px] bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Read-only task
        </div>
      )}
    </div>
  );
}
