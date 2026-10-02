import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'pill' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'pill',
    size = 'md',
    className = '',
    children,
    disabled,
    ...props
}) => {
    let buttonClasses = '';

    // Base variant classes
    if (variant === 'pill') {
        buttonClasses = 'btn-pill';
    } else if (variant === 'ghost') {
        buttonClasses = 'btn-ghost';
    }

    // Add size classes for pill buttons
    if (variant === 'pill' && size) {
        buttonClasses += ` size-${size}`;
    }

    // Add disabled class if needed
    if (disabled) {
        buttonClasses += ' opacity-60 cursor-not-allowed';
    }

    // Add custom className
    if (className) {
        buttonClasses += ` ${className}`;
    }

    return (
        <button
            className={buttonClasses}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};