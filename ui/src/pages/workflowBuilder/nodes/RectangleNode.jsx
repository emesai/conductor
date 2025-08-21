import { Handle, Position } from "reactflow";
import { Trash2 } from "lucide-react";
import AddTaskButton from "../AddTaskButton";

export default function RectangleNode({ id, data }) {
  return (
    <div className="relative p-4 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.4)] w-[260px] rounded cursor-pointer">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Tombol hapus pojok kanan atas */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          data?.onRemoveTask?.(id);
        }}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      <div className="flex justify-between">
        <div className="flex-1">
          <h3 className="text-xs">{data.name}</h3>
          <p className="text-xs">{data.taskReferenceName}</p>
        </div>
        <div className="text-xs p-1.5 bg-stone-300 rounded">
          {data.type || "Task"}
        </div>
      </div>

      {/* Tombol add tetap ada */}
      <AddTaskButton id={id} data={data} disabled={false} />
    </div>
  );
}
