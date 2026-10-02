import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Dialog, type DialogMode, type DialogVariant } from '../components/ui/Dialog';

export interface DialogOptions {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: DialogVariant;
}

interface DialogContextType {
    alert: (options: DialogOptions | string) => Promise<void>;
    confirm: (options: DialogOptions | string) => Promise<boolean>;
}

interface DialogState {
    mode: DialogMode;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    variant: DialogVariant;
    resolve: (value: boolean) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

const normalizeOptions = (options: DialogOptions | string): DialogOptions =>
    typeof options === 'string' ? { message: options } : options;

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dialog, setDialog] = useState<DialogState | null>(null);

    const close = useCallback((result: boolean) => {
        setDialog((current) => {
            current?.resolve(result);
            return null;
        });
    }, []);

    const openDialog = useCallback((mode: DialogMode, options: DialogOptions | string) => {
        const normalized = normalizeOptions(options);

        return new Promise<boolean>((resolve) => {
            setDialog({
                mode,
                title: normalized.title || (mode === 'confirm' ? 'Please confirm' : 'Notice'),
                message: normalized.message,
                confirmLabel: normalized.confirmLabel || (mode === 'confirm' ? 'Confirm' : 'OK'),
                cancelLabel: normalized.cancelLabel || 'Cancel',
                variant: normalized.variant || 'default',
                resolve,
            });
        });
    }, []);

    const value = useMemo<DialogContextType>(() => ({
        alert: async (options) => {
            await openDialog('alert', options);
        },
        confirm: (options) => openDialog('confirm', options),
    }), [openDialog]);

    return (
        <DialogContext.Provider value={value}>
            {children}
            <Dialog
                open={!!dialog}
                mode={dialog?.mode || 'alert'}
                title={dialog?.title || ''}
                message={dialog?.message || ''}
                confirmLabel={dialog?.confirmLabel || 'OK'}
                cancelLabel={dialog?.cancelLabel || 'Cancel'}
                variant={dialog?.variant || 'default'}
                onConfirm={() => close(true)}
                onCancel={() => close(false)}
            />
        </DialogContext.Provider>
    );
};

export const useDialog = (): DialogContextType => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within DialogProvider');
    }
    return context;
};
