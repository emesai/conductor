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

const CFG = {
  widths: { circle: 64, rectangle: 260 },
  canvasWidth: 900,
  vGap: 150,
};


const nextId = (nodes) => String(Math.max(0, ...nodes.map((n) => +n.id || 0)) + 1);

const chainOrder = (edges, startId = "1") => {
  const next = Object.fromEntries(edges.map((e) => [e.source, e.target]));
  const order = [];
  let cur = startId;
  while (cur) {
    order.push(cur);
    cur = next[cur];
  }
  return order;
};

const layoutNodes = (nodes, edges) => {
  const order = chainOrder(edges);
  return order
    .map((id, idx) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return null;
      const width = CFG.widths[node.type] || 150;
      return {
        ...node,
        draggable: false,
        position: { x: CFG.canvasWidth / 2 - width / 2, y: idx * CFG.vGap },
        data: { ...node.data },
      };
    })
    .filter(Boolean);
};

const spliceEdgesForInsert = (edges, parentId, newId) => {
  const oldEdge = edges.find((e) => e.source === parentId);
  const withoutParent = edges.filter((e) => e.source !== parentId);
  const result = [
    ...withoutParent,
    { id: `e${parentId}-${newId}`, source: parentId, target: newId },
  ];
  if (oldEdge) {
    result.push({
      id: `e${newId}-${oldEdge.target}`,
      source: newId,
      target: oldEdge.target,
    });
  }
  return result;
};

const reconnectEdgesOnRemove = (edges, nodeId) => {
  const incoming = edges.filter((e) => e.target === nodeId);
  const outgoing = edges.filter((e) => e.source === nodeId);
  let result = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);

  if (incoming.length && outgoing.length) {
    incoming.forEach((inE) => {
      outgoing.forEach((outE) => {
        result.push({
          id: `e${inE.source}-${outE.target}`,
          source: inE.source,
          target: outE.target,
        });
      });
    });
  }
  return result;
};

const makeTaskSchema = (type) => {
  switch (type) {
    case "HTTP":
      return { inputParameters: [], httpUrl: "", httpMethod: "GET", headers: [] };
    case "INLINE":
      return { inputParameters: [], expression: "" };
    case "SIMPLE":
    default:
      return { inputParameters: [] };
  }
};

const getOrderedTasks = (nodes, edges) =>
  chainOrder(edges)
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n) => n && n.type === "rectangle")
    .map((node) => {
      const { id, name, taskReferenceName, type, inputParameters = [], ...rest } = node.data;
      return {
        id,
        name,
        taskReferenceName,
        type,
        inputParameters: Array.isArray(inputParameters) ? inputParameters : [],
        ...rest,
      };
    });

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workFlowData, setWorkFlowData] = useState({
    name: "workflow_1",
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

  const handleRemoveTask = useCallback((taskId) => {
    setNodes((prevNodes) => {
      const remaining = prevNodes.filter((n) => n.id !== taskId);
      setEdges((prevEdges) => {
        const newEdges = reconnectEdgesOnRemove(prevEdges, taskId);
        const laidOut = layoutNodes(remaining, newEdges);
        setNodes(laidOut);
        return newEdges;
      });
      return remaining;
    });

    setWorkFlowData((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }));
  }, []);

  const handleAddTask = useCallback(
    (parentId, type) => {
      setNodes((prevNodes) => {
        const id = nextId(prevNodes);
        const taskData = {
          id,
          name: `Task ${id}`,
          taskReferenceName: `task_${id}_ref`,
          type,
          ...makeTaskSchema(type),
        };
        const newNode = {
          id,
          type: "rectangle",
          data: { ...taskData, onAddTask: handleAddTask, onRemoveTask: handleRemoveTask },
          draggable: false,
          position: { x: 0, y: 0 },
        };

        setEdges((prevEdges) => {
          const newEdges = spliceEdgesForInsert(prevEdges, parentId, id);
          const laidOut = layoutNodes([...prevNodes, newNode], newEdges);
          setNodes(laidOut);
          return newEdges;
        });

        return prevNodes;
      });
    },
    [handleRemoveTask]
  );

  const handleTaskChange = useCallback(
    (taskId, field, value) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === taskId
            ? {
              ...n,
              data: {
                ...n.data,
                [field]: value,
                onAddTask: handleAddTask,
                onRemoveTask: handleRemoveTask,
              },
            }
            : n
        )
      );
    },
    [handleAddTask, handleRemoveTask]
  );

  const handleTaskParamChange = useCallback(
    (taskId, index, field, value) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === taskId
            ? {
              ...n,
              data: {
                ...n.data,
                inputParameters: (n.data.inputParameters || []).map((p, i) =>
                  i === index ? { ...p, [field]: value } : p
                ),
                onAddTask: handleAddTask,
                onRemoveTask: handleRemoveTask,
              },
            }
            : n
        )
      );
    },
    [handleAddTask, handleRemoveTask]
  );

  const handleAddTaskParam = useCallback(
    (taskId) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === taskId
            ? {
              ...n,
              data: {
                ...n.data,
                inputParameters: [...(n.data.inputParameters || []), { key: "", value: "" }],
                onAddTask: handleAddTask,
                onRemoveTask: handleRemoveTask,
              },
            }
            : n
        )
      );
    },
    [handleAddTask, handleRemoveTask]
  );

  const handleRemoveTaskParam = useCallback(
    (taskId, index) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === taskId
            ? {
              ...n,
              data: {
                ...n.data,
                inputParameters: (n.data.inputParameters || []).filter((_, i) => i !== index),
                onAddTask: handleAddTask,
                onRemoveTask: handleRemoveTask,
              },
            }
            : n
        )
      );
    },
    [handleAddTask, handleRemoveTask]
  );

  const handleWorkflowChange = useCallback((field, value) => {
    setWorkFlowData((prev) => ({ ...prev, [field]: value }));
  }, []);



  useEffect(() => {
    setWorkFlowData((prev) => ({ ...prev, tasks: getOrderedTasks(nodes, edges) }));
  }, [nodes, edges]);

  useEffect(() => {
    if (!selectedNode) return;
    const latest = nodes.find((n) => n.id === selectedNode.id);
    if (latest) setSelectedNode(latest);
  }, [nodes, selectedNode]);

  useEffect(() => {
    const start = {
      id: "1",
      type: "circle",
      data: { label: "Start", type: "start", onAddTask: handleAddTask },
      position: { x: CFG.canvasWidth / 2 - CFG.widths.circle / 2, y: 0 },
      draggable: false,
    };
    const end = {
      id: "2",
      type: "circle",
      data: { label: "End", type: "end" },
      position: { x: CFG.canvasWidth / 2 - CFG.widths.circle / 2, y: CFG.vGap },
      draggable: false,
    };
    const initEdges = [{ id: "e1-2", source: "1", target: "2" }];
    setNodes(layoutNodes([start, end], initEdges));
    setEdges(initEdges);
  }, [handleAddTask]);

  return (
    <div className="flex h-screen">
      <div className="flex-[2] border-r border-r-[#ddd]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(e, node) => setSelectedNode(node)}
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
