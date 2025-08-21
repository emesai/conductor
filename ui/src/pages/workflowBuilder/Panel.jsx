import { useEffect, useState } from "react";
import { Input } from "../../components";
import TaskFormSimple from "./tasks/TaskFormSimple";
import TaskFormHttp from "./tasks/TaskFormHttp";
import TaskFormInline from "./tasks/TaskFormInline";
import { normalizeWorkflow } from "../../utils/normalizeWorkflow ";
import CopyButton from "./CopyButton";

export default function Panel({
  selectedNode,
  workflowData,
  onWorkflowChange,
  taskHandlers,
}) {
  const [activeTab, setActiveTab] = useState("Workflow");
  const tabs = ["Workflow", "Task", "Code"];

  useEffect(() => {
    if (selectedNode) setActiveTab("Task");
  }, [selectedNode]);

  const extractValue = (e) => (e?.target ? e.target.value : e);

  const handleChange = (field) => (e) => {
    onWorkflowChange && onWorkflowChange(field, extractValue(e));
  };

  const { onTaskChange, onParamChange, onAddParam, onRemoveParam } =
    taskHandlers || {};

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-gray-200">
        {/* Tabs */}
        <nav className="flex bg-white p-3 border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-2 px-3 text-sm font-medium transition-colors duration-200 min-w-[60px]
                ${activeTab === tab
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-blue-600" />
              )}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div>
          {/* Workflow Tab */}
          {activeTab === "Workflow" && (
            <div className="bg-white p-4">
              <h3 className="mb-4">Workflow Details</h3>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <Input
                    fullWidth
                    label="Name"
                    value={workflowData?.name ?? ""}
                    onChange={handleChange("name")}
                  />
                </div>
                <div className="w-1/2">
                  <Input
                    fullWidth
                    label="Description"
                    value={workflowData?.description ?? ""}
                    onChange={handleChange("description")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Task Tab */}
          {activeTab === "Task" && selectedNode && (
            <div className="bg-white p-4">
              <h3 className="mb-4">Task Settings</h3>

              {/* === Dynamic Form berdasarkan type === */}
              {selectedNode?.data?.type === "SIMPLE" && (
                <TaskFormSimple
                  selectedNode={selectedNode}
                  onTaskChange={onTaskChange}
                  onParamChange={onParamChange}
                  onAddParam={onAddParam}
                  onRemoveParam={onRemoveParam}
                />
              )}

              {selectedNode?.data?.type === "HTTP" && (
                <TaskFormHttp
                  selectedNode={selectedNode}
                  onTaskChange={onTaskChange}
                  onParamChange={onParamChange}
                  onAddParam={onAddParam}
                  onRemoveParam={onRemoveParam}
                />
              )}

              {selectedNode?.data?.type === "INLINE" && (
                <TaskFormInline
                  selectedNode={selectedNode}
                  onTaskChange={onTaskChange}
                />
              )}

              {!["SIMPLE", "HTTP", "INLINE"].includes(selectedNode?.data?.type) && (
                <p className="text-sm text-gray-500">
                  Task type <b>{selectedNode?.data?.type}</b> not found.
                </p>
              )}
            </div>
          )}

          {/* Code Tab */}
          {activeTab === "Code" && (
            <div className="bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Workflow JSON</h3>
                <CopyButton workflowData={workflowData} />
              </div>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(normalizeWorkflow(workflowData), null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
