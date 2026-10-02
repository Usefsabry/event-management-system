import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, duration = 4000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Show animation
        setTimeout(() => setIsVisible(true), 50);

        // Auto hide
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const toastElement = (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
            <div className="flex justify-center pt-6 px-4">
                <div className={`
                    bg-white rounded-2xl shadow-2xl border-l-4 p-4 max-w-sm w-full
                    transform transition-all duration-500 ease-out pointer-events-auto
                    ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
                    ${type === 'success' ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50' : ''}
                    ${type === 'error' ? 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50' : ''}
                    ${type === 'warning' ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50' : ''}
                    ${type === 'info' ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50' : ''}
                `}>
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center
                                ${type === 'success' ? 'bg-green-100' : ''}
                                ${type === 'error' ? 'bg-red-100' : ''}
                                ${type === 'warning' ? 'bg-yellow-100' : ''}
                                ${type === 'info' ? 'bg-blue-100' : ''}
                            `}>
                                {getIcon()}
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                                {message}
                            </p>
                        </div>
                        <div className="ml-2">
                            <button
                                onClick={() => {
                                    setIsLeaving(true);
                                    setTimeout(onClose, 300);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(toastElement, document.body);
};

export default Toast;