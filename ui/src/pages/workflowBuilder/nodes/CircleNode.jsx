import { Handle, Position } from "reactflow";
import AddTaskButton from "../AddTaskButton";

export default function CircleNode({ id, data }) {
  return (
    <div className="relative">
      {(data.type === "end" || data.type === "task") && (
        <Handle type="target" position={Position.Top} />
      )}
      {(data.type === "start" || data.type === "task") && (
        <Handle type="source" position={Position.Bottom} />
      )}

      {/* Lingkaran node */}
      <div
        className={
          `w-16 h-16 rounded-full border-2 shadow-sm flex items-center justify-center text-sm font-medium ` +
          (data?.color ? "" : "bg-white")
        }
        style={{ background: data?.color || undefined }}
      >
        {data?.label || "Circle"}
      </div>

      {/* Tombol add (kecuali end) */}
      <AddTaskButton id={id} data={data} disabled={data.type === "end"} />
    </div>
  );
}
