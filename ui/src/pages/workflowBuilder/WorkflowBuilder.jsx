import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import Panel from "./Panel";
import CircleNode from "./nodes/CircleNode";
import RectangleNode from "./nodes/RectangleNode";

const nodeTypes = { circle: CircleNode, rectangle: RectangleNode };

const NODE_WIDTHS = {
  circle: 64,     // perkiraan diameter circle node
  rectangle: 260, // perkiraan lebar rectangle node
};
const CANVAS_WIDTH = 900; // area diagram

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workFlowData, setWorkFlowData] = useState({
    name: "workflow-1",
    description: "workflow-description",
    version: "1",
    tasks: [],
    inputParameters: [],
    outPutParameters: {},
    schemaVersion: 2,
    restartable: true,
    workflowStatusListenerEnabled: false,
    ownerEmail: "example@email.com",
    timeoutPolicy: "ALERT_ONLY",
    timeoutSeconds: 0,
  });

  // === Auto Layout: hanya update posisi, jangan sentuh data ===
  const recalcLayout = useCallback((nodes, edges) => {
    const order = [];
    let current = "1"; // Start node
    const edgeMap = Object.fromEntries(edges.map((e) => [e.source, e.target]));

    while (current) {
      order.push(current);
      current = edgeMap[current];
    }

    return nodes.map((node) => {
      const idx = order.indexOf(node.id);
      const width = NODE_WIDTHS[node.type] || 150;
      return {
        ...node,
        draggable: false,
        position: {
          x: CANVAS_WIDTH / 2 - width / 2, // rata tengah
          y: idx * 150,
        },
        data: { ...node.data },
      };
    });
  }, []);

  // === Add Task ===
  const handleAddTask = useCallback(
    (parentId, type) => {
      setNodes((prevNodes) => {
        const newId = (prevNodes.length + 1).toString();

        // === Default task per type ===
        let newTask = {
          id: newId,
          name: `Task ${newId}`,
          taskReferenceName: `task_${newId}_ref`,
          type,
          inputParameters: [],
        };

        if (type === "HTTP") {
          newTask = {
            ...newTask,
            httpUrl: "https://example.com/api",
            httpMethod: "GET",
            headers: {},
          };
        }

        if (type === "INLINE") {
          newTask = {
            ...newTask,
            inlineScript: "// write your code here",
            inputParameters: [],
          };
        }

        const newNode = {
          id: newId,
          type: "rectangle",
          data: { ...newTask, onAddTask: handleAddTask },
          draggable: false,
          position: { x: 0, y: 0 },
        };

        // ✅ Update workflowData langsung
        setWorkFlowData((prev) => ({
          ...prev,
          tasks: [...prev.tasks, newTask],
        }));

        setEdges((prevEdges) => {
          const oldEdge = prevEdges.find((e) => e.source === parentId);
          let newEdges = prevEdges.filter((e) => e.source !== parentId);

          if (oldEdge) {
            newEdges.push({
              id: `e${parentId}-${newId}`,
              source: parentId,
              target: newId,
            });
            newEdges.push({
              id: `e${newId}-${oldEdge.target}`,
              source: newId,
              target: oldEdge.target,
            });
          } else {
            newEdges.push({
              id: `e${parentId}-${newId}`,
              source: parentId,
              target: newId,
            });
          }

          const updatedNodes = recalcLayout([...prevNodes, newNode], newEdges);
          setNodes(updatedNodes);
          return newEdges;
        });

        return prevNodes;
      });
    },
    [recalcLayout]
  );


  // === Workflow Change ===
  const handleWorkflowChange = useCallback((field, value) => {
    setWorkFlowData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // === Update Task (field) ===
  const handleTaskChange = useCallback(
    (taskId, field, value) => {
      // Update nodes
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === taskId
            ? {
              ...node,
              data: {
                ...node.data,
                [field]: value,
                onAddTask: handleAddTask,
              },
            }
            : node
        )
      );

      // Update workflowData.tasks
      setWorkFlowData((prev) => {
        const updatedTasks = prev.tasks.some((t) => t.id === taskId)
          ? prev.tasks.map((t) =>
            t.id === taskId ? { ...t, [field]: value } : t
          )
          : [...prev.tasks, { id: taskId, [field]: value }];
        return { ...prev, tasks: updatedTasks };
      });
    },
    [setNodes, setWorkFlowData, handleAddTask]
  );

  // === Update Task Param ===
  const handleTaskParamChange = useCallback(
    (taskId, index, field, value) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === taskId
            ? {
              ...node,
              data: {
                ...node.data,
                inputParameters: node.data.inputParameters.map((p, i) =>
                  i === index ? { ...p, [field]: value } : p
                ),
                onAddTask: handleAddTask,
              },
            }
            : node
        )
      );

      setWorkFlowData((prev) => {
        const updatedTasks = prev.tasks.map((t) =>
          t.id === taskId
            ? {
              ...t,
              inputParameters: t.inputParameters.map((p, i) =>
                i === index ? { ...p, [field]: value } : p
              ),
            }
            : t
        );
        return { ...prev, tasks: updatedTasks };
      });
    },
    [setNodes, setWorkFlowData, handleAddTask]
  );

  // === Add Task Param ===
  const handleAddTaskParam = useCallback(
    (taskId) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === taskId
            ? {
              ...node,
              data: {
                ...node.data,
                inputParameters: [
                  ...(node.data.inputParameters || []),
                  { key: "", value: "" },
                ],
                onAddTask: handleAddTask,
              },
            }
            : node
        )
      );

      setWorkFlowData((prev) => {
        const updatedTasks = prev.tasks.map((t) =>
          t.id === taskId
            ? {
              ...t,
              inputParameters: [
                ...(t.inputParameters || []),
                { key: "", value: "" },
              ],
            }
            : t
        );
        return { ...prev, tasks: updatedTasks };
      });
    },
    [setNodes, setWorkFlowData, handleAddTask]
  );

  // === Remove Task Param ===
  const handleRemoveTaskParam = useCallback(
    (taskId, index) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === taskId
            ? {
              ...node,
              data: {
                ...node.data,
                inputParameters: node.data.inputParameters.filter(
                  (_, i) => i !== index
                ),
                onAddTask: handleAddTask,
              },
            }
            : node
        )
      );

      setWorkFlowData((prev) => {
        const updatedTasks = prev.tasks.map((t) =>
          t.id === taskId
            ? {
              ...t,
              inputParameters: t.inputParameters.filter((_, i) => i !== index),
            }
            : t
        );
        return { ...prev, tasks: updatedTasks };
      });
    },
    [setNodes, setWorkFlowData, handleAddTask]
  );

  const onNodeClick = (event, node) => setSelectedNode(node);

  // === Sync selectedNode ke nodes terbaru ===
  useEffect(() => {
    if (selectedNode) {
      const latest = nodes.find((n) => n.id === selectedNode.id);
      if (latest) setSelectedNode(latest);
    }
  }, [nodes, selectedNode]);

  // === Init ===
  useEffect(() => {
    const start = {
      id: "1",
      type: "circle",
      data: { label: "Start", type: "start", onAddTask: handleAddTask },
      position: { x: 250, y: 0 },
      draggable: false,
    };
    const end = {
      id: "2",
      type: "circle",
      data: { label: "End", type: "end" },
      position: { x: 250, y: 150 },
      draggable: false,
    };

    const initNodes = [start, end];
    const initEdges = [{ id: "e1-2", source: "1", target: "2" }];

    setNodes(recalcLayout(initNodes, initEdges));
    setEdges(initEdges);
  }, [handleAddTask, recalcLayout]);

  return (
    <div className="flex h-screen">
      <div className="flex-[2] border-r border-r-[#ddd]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          nodeTypes={nodeTypes}
          className="bg-white"
          nodesDraggable={false}
          nodesConnectable={false}
          panOnDrag={true}
          zoomOnScroll
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      <Panel
        selectedNode={selectedNode}
        workflowData={workFlowData}
        onWorkflowChange={handleWorkflowChange}
        taskHandlers={{
          onTaskChange: handleTaskChange,
          onParamChange: handleTaskParamChange,
          onAddParam: handleAddTaskParam,
          onRemoveParam: handleRemoveTaskParam,
        }}
      />
    </div>
  );
}
