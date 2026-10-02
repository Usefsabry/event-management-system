import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

export type DialogMode = 'alert' | 'confirm';
export type DialogVariant = 'default' | 'danger';

export interface DialogViewProps {
    open: boolean;
    mode: DialogMode;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    variant: DialogVariant;
    onConfirm: () => void;
    onCancel: () => void;
}

export const Dialog: React.FC<DialogViewProps> = ({
    open,
    mode,
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant,
    onConfirm,
    onCancel,
}) => {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onCancel]);

    if (!open) return null;

    const isDanger = variant === 'danger';

    const dialog = (
        <div className="dialog-overlay" onClick={onCancel} role="presentation">
            <div
                className="dialog-card"
                role={mode === 'alert' ? 'alertdialog' : 'dialog'}
                aria-modal="true"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-message"
                onClick={(event) => event.stopPropagation()}
            >
                <div className={`dialog-icon ${isDanger ? 'danger' : 'default'}`}>
                    {isDanger ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                        </svg>
                    )}
                </div>

                <h3 id="dialog-title" className="text-subheading mb-2">
                    {title}
                </h3>
                <p id="dialog-message" className="text-body text-fog-gray mb-8">
                    {message}
                </p>

                <div className="flex items-center justify-center gap-3">
                    {mode === 'confirm' && (
                        <Button type="button" variant="ghost" onClick={onCancel}>
                            {cancelLabel}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="pill"
                        size="sm"
                        className={isDanger ? 'danger' : ''}
                        onClick={onConfirm}
                        autoFocus
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );

    return createPortal(dialog, document.body);
};
