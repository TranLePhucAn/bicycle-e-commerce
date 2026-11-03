import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'fa-circle-check text-success';
            case 'danger':
                return 'fa-circle-xmark text-danger';
            case 'warning':
                return 'fa-triangle-exclamation text-warning';
            default:
                return 'fa-circle-info text-primary';
        }
    };

    const getBorderClass = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'border-success';
            case 'danger':
                return 'border-danger';
            case 'warning':
                return 'border-warning';
            default:
                return 'border-primary';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div
                className="toast-container position-fixed top-0 end-0 p-3"
                style={{ zIndex: 9999, maxWidth: '380px' }}
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast show shadow-lg border-start border-4 ${getBorderClass(
                            toast.type
                        )} bg-white mb-2`}
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        <div className="toast-header border-0 pb-1">
                            <i className={`fa-solid ${getIcon(toast.type)} me-2 fs-5`}></i>
                            <strong className="me-auto text-dark text-capitalize">
                                {toast.type === 'success'
                                    ? 'Thành công'
                                    : toast.type === 'danger'
                                        ? 'Lỗi'
                                        : toast.type === 'warning'
                                            ? 'Cảnh báo'
                                            : 'Thông báo'}
                            </strong>
                            <button
                                type="button"
                                className="btn-close ms-2 mb-1"
                                onClick={() => removeToast(toast.id)}
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="toast-body pt-0 text-secondary fs-6">
                            {toast.message}
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
