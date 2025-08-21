import { Handle, Position } from "reactflow";
import AddTaskButton from "../AddTaskButton";

export default function RectangleNode({ id, data }) {
  return (
    <div className="relative p-4 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.4)] w-[260px] rounded cursor-pointer">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div className="flex justify-between">
        <div className="flex-1">
          <h3 className="text-xs">{data.name}</h3>
          <p className="text-xs">{data.taskReferenceName}</p>
        </div>
        <div className="text-xs p-1.5 bg-stone-300 rounded">
          {data.type || "Task"}
        </div>
      </div>

      {/* Tombol add selalu ada untuk rectangle */}
      <AddTaskButton id={id} data={data} disabled={false} />
    </div>
  );
}
