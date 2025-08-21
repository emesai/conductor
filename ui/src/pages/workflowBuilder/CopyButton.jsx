import { useState } from "react";
import { normalizeWorkflow } from "../../utils/normalizeWorkflow ";

export default function CopyButton({ workflowData }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(
            JSON.stringify(normalizeWorkflow(workflowData), null, 2)
        );
        setCopied(true);

        // Balikin ke "Copy" lagi setelah 1 detik
        setTimeout(() => setCopied(false), 1000);
    };

    return (
        <button
            className={`text-xs px-2 py-1 rounded ${copied ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
            onClick={handleCopy}
            disabled={copied} // selama "Copied" disable biar ga spam
        >
            {copied ? "Copied!" : "Copy"}
        </button>
    );
}
