import { Input } from "../../../components";

export default function TaskFormSimple({
    selectedNode,
    onTaskChange,
    onParamChange,
    onAddParam,
    onRemoveParam,
}) {
    const extractValue = (e) => (e?.target ? e.target.value : e);

    return (
        <div>
            <div className="flex space-x-4">
                <div className="w-1/2">
                    <Input
                        fullWidth
                        label="Name"
                        value={selectedNode?.data?.name ?? ""}
                        onChange={(e) =>
                            onTaskChange?.(selectedNode.id, "name", extractValue(e))
                        }
                    />
                </div>
                <div className="w-1/2">
                    <Input
                        fullWidth
                        label="Reference Name"
                        value={selectedNode?.data?.taskReferenceName ?? ""}
                        onChange={(e) =>
                            onTaskChange?.(
                                selectedNode.id,
                                "taskReferenceName",
                                extractValue(e)
                            )
                        }
                    />
                </div>
            </div>

            {/* Input Parameters */}
            <div className="mt-6">
                <h4 className="mb-2">Input Parameters</h4>
                {(selectedNode?.data?.inputParameters || []).map((param, idx) => (
                    <div
                        key={idx}
                        className="flex space-x-2 border p-2 mb-2 items-center"
                    >
                        <Input
                            label="Key"
                            value={param.key ?? ""}
                            onChange={(e) =>
                                onParamChange?.(
                                    selectedNode.id,
                                    idx,
                                    "key",
                                    extractValue(e)
                                )
                            }
                        />
                        <Input
                            label="Value"
                            value={param.value ?? ""}
                            onChange={(e) =>
                                onParamChange?.(
                                    selectedNode.id,
                                    idx,
                                    "value",
                                    extractValue(e)
                                )
                            }
                        />
                        <button
                            className="text-red-500"
                            onClick={() => onRemoveParam?.(selectedNode.id, idx)}
                        >
                            🗑
                        </button>
                    </div>
                ))}

                <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => onAddParam?.(selectedNode.id)}
                >
                    + Add parameter
                </button>
            </div>
        </div>
    );
}
