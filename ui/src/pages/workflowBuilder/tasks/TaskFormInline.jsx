import { Input } from "../../../components";

export default function TaskFormInline({ selectedNode, onTaskChange }) {
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
            <textarea
                className="w-full border rounded p-2 mt-3 text-sm"
                rows={6}
                placeholder="Write inline code here..."
                value={selectedNode?.data?.inlineScript ?? ""}
                onChange={(e) =>
                    onTaskChange?.(selectedNode.id, "inlineScript", extractValue(e))
                }
            />
        </div>
    );
}
