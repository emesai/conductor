import { Input } from "../../../components";

export default function TaskFormHttp({ selectedNode, onTaskChange }) {
    const extractValue = (e) => (e?.target ? e.target.value : e);

    return (
        <div>
            <Input
                fullWidth
                label="Name"
                value={selectedNode?.data?.name ?? ""}
                onChange={(e) =>
                    onTaskChange?.(selectedNode.id, "name", extractValue(e))
                }
            />
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
            <Input
                fullWidth
                label="HTTP URL"
                value={selectedNode?.data?.httpUrl ?? ""}
                onChange={(e) =>
                    onTaskChange?.(selectedNode.id, "httpUrl", extractValue(e))
                }
            />
            <select
                className="border rounded p-2 mt-3 w-full"
                value={selectedNode?.data?.httpMethod ?? "GET"}
                onChange={(e) =>
                    onTaskChange?.(selectedNode.id, "httpMethod", extractValue(e))
                }
            >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
            </select>
        </div>
    );
}
