import { useEffect, useRef, useState } from "react";
import { Plus, Globe, Code2, Hammer, X } from "lucide-react";

export default function AddTaskButton({ id, data, disabled, }) {
    const [open, setOpen] = useState(false);
    const popRef = useRef(null);

    // Tutup popover kalau klik di luar
    useEffect(() => {
        function onDocClick(e) {
            if (!popRef.current) return;
            if (!popRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open]);

    const options = [
        { key: "SIMPLE", label: "SIMPLE", icon: <Hammer className="w-4 h-4" /> },
        { key: "HTTP", label: "HTTP", icon: <Globe className="w-4 h-4" /> },
        { key: "INLINE", label: "INLINE", icon: <Code2 className="w-4 h-4" /> },
    ];

    const handleChoose = (type, e) => {
        e.stopPropagation();
        data?.onAddTask?.(id, type);
        setOpen(false);
    };

    if (disabled) return null;

    return (
        <div ref={popRef}>
            {/* Tombol + */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                className="rounded-full cursor-pointer w-4 h-4 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] flex justify-center items-center absolute -bottom-2 left-1/2 -translate-x-1/2"
            >
                <Plus className="w-3 h-3 text-gray-800" strokeWidth={3} />
            </button>

            {/* Popover */}
            {open && (
                <div
                    className="absolute z-50 left-1/2 -translate-x-1/2 bottom-8 w-56 rounded-xl bg-white shadow-xl border border-gray-200 p-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs font-semibold text-gray-500">
                            QUICK ADD
                        </span>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2">
                        {options.map((opt) => (
                            <button
                                key={opt.key}
                                onClick={(e) => handleChoose(opt.key, e)}
                                className="flex flex-col items-center justify-center gap-1 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors p-3"
                            >
                                {opt.icon}
                                <span className="text-[11px] font-medium text-gray-700">
                                    {opt.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
