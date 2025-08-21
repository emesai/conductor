import { Dropdown, Input } from "../../../components";
import TaskCommonFields from "./TaskCommonFields";

export const httpMethods = ["GET", "POST", "PUT", "DELETE"];

export default function TaskFormHttp({
    selectedNode,
    onTaskChange,
    onParamChange,
    onAddParam,
    onRemoveParam,
}) {
    const extractValue = (e) => (e?.target ? e.target.value : e);

    return (
        <div>
            {/* Reuse Common Fields */}
            <TaskCommonFields
                selectedNode={selectedNode}
                onTaskChange={onTaskChange}
                onParamChange={onParamChange}
                onAddParam={onAddParam}
                onRemoveParam={onRemoveParam}
            />

            {/* HTTP Specific Fields */}
            <div className="mt-6">
                <Input
                    fullWidth
                    label="HTTP URL"
                    value={selectedNode?.data?.httpUrl ?? ""}
                    onChange={(e) =>
                        onTaskChange?.(selectedNode.id, "httpUrl", extractValue(e))
                    }
                />
            </div>

            <div className="mt-4">
                <Dropdown
                    label="Method"
                    fullWidth
                    options={httpMethods}
                    value={
                        httpMethods.includes(selectedNode?.data?.httpMethod)
                            ? selectedNode.data.httpMethod
                            : "GET"
                    }
                    onChange={(_, newValue) =>
                        onTaskChange?.(selectedNode.id, "httpMethod", newValue)
                    }
                />
            </div>
        </div>
    );
}
