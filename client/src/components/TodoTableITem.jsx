
import { useContext } from "react";
import AppContext from "../context/AppContext";
import toast from "react-hot-toast";
import { FiTrash2, FiEdit2 } from "react-icons/fi";

const TodoTableItem = ({ todo, fetchTodos, index }) => {
  const { title, status, createdAt, id } = todo;
  const { axios } = useContext(AppContext)

  const todoDate = new Date(createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const deleteTodo = async () => {

    try {
      const { data } = await axios.delete(`/api/v1/todos/${id}`);
      if (data.success) {
        toast.success("Todo deleted successfully");
        await fetchTodos();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  return (
    <tr className="border-b border-gray-700 hover:bg-gray-700/30 transition-all">
      <td className="px-2 py-4">{index}</td>
      <td className="px-2 py-4">{title}</td>
      <td className="px-2 py-4 max-sm:hidden">{todoDate}</td>
      <td className="px-2 py-4 max-sm:hidden">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === "completed"
              ? "bg-green-600 text-white"
              : status === "inProgress"
              ? "bg-blue-600 text-white"
              : "bg-orange-600 text-white"
          }`}
        >
          {status}
        </span>
      </td>
      <td className="px-2 py-4 flex items-center gap-3 text-sm">
        <FiTrash2
          onClick={deleteTodo}
          className="text-red-500 cursor-pointer hover:scale-110 transition-transform"
        />
      </td>
    </tr>
  );
};

export default TodoTableItem;
