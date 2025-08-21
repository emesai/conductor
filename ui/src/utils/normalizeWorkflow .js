// Helper: array of {key, value} → object
const toObject = (arr) =>
    Array.isArray(arr)
        ? arr.reduce((acc, { key, value }) => {
            if (key) acc[key] = value;
            return acc;
        }, {})
        : {};

// Build inputParameters tergantung type
const buildInputParameters = (task) => {
    const baseParams = toObject(task.inputParameters);

    switch (task.type) {
        case "SIMPLE":
            return baseParams;

        case "HTTP":
            return {
                ...baseParams,
                http_request: {
                    uri: task.httpUrl || "",
                    method: task.httpMethod || "GET",
                    headers: toObject(task.headers),
                },
            };

        case "INLINE":
            return {
                ...baseParams,
                script: task.script || "",
            };

        default:
            return baseParams;
    }
};

// Normalize workflowData ke format Conductor
export function normalizeWorkflow(workflowData) {
    return {
        name: workflowData.name,
        description: workflowData.description,
        version: parseInt(workflowData.version ?? "1", 10),
        tasks: (workflowData.tasks || []).map((task) => ({
            name: task.name,
            taskReferenceName: task.taskReferenceName,
            type: task.type,
            inputParameters: buildInputParameters(task),
        })),
        inputParameters: workflowData.inputParameters ?? [],
        outputParameters: workflowData.outputParameters ?? {},
        schemaVersion: workflowData.schemaVersion ?? 2,
        restartable: workflowData.restartable ?? true,
        workflowStatusListenerEnabled:
            workflowData.workflowStatusListenerEnabled ?? false,
        ownerEmail: workflowData.ownerEmail ?? "",
        timeoutPolicy: workflowData.timeoutPolicy ?? "ALERT_ONLY",
        timeoutSeconds: workflowData.timeoutSeconds ?? 0,
    };
}
