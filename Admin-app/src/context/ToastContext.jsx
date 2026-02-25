import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto min-w-[300px] px-5 py-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-4 animate-slide-in-right transform transition-all duration-300`}
                        style={{
                            backgroundColor: '#1a1f2e',
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.1)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">
                                {toast.type === "success" ? "✓" : "⚠"}
                            </span>
                            <span className="font-semibold text-sm">{toast.message}</span>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white hover:opacity-70 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </ToastContext.Provider>
    );
};
