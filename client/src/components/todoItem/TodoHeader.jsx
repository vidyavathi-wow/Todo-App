import React, { useContext, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Select from "../common/Select";
import toast from "react-hot-toast";
import AppContext from "../../context/AppContext";

export default function TodoHeader({ todo, onStatusUpdated }) {
  const { axios,fetchTodos} = useContext(AppContext);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (!todo?.id) return;
    setUpdatingStatus(true);
    try {
      const {data} = await axios.put(`/api/v1/todos/${todo.id}`, {...todo,
        status: newStatus,
      });
      if(data.success){
      toast.success("Status updated successfully!");
      if (onStatusUpdated) onStatusUpdated(data);
      fetchTodos();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="bg-card border-b border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 overflow-x-auto">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-primary hover:text-primary/80 shrink-0"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Go Back</span>
      </button>

      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-4 text-sm min-w-0">
        <div className="shrink-0">
          <span className="text-white">Priority: </span>
          <span className="font-medium">{todo.priority}</span>
        </div>

        <div className="hidden sm:block h-4 w-px bg-border" />

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-white">Status: </span>
          <Select
            value={todo.status}
            disabled={updatingStatus}
            onChange={handleStatusChange}
            options={["pending", "inProgress", "completed"]}
          />
        </div>

        <div className="hidden sm:block h-4 w-px bg-border" />
      </div>
    </div>
  );
}
