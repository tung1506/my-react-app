import React from 'react';

export const Button = ({ children, onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`py-2 px-4 rounded-lg font-semibold ${className}`}
        >
            {children}
        </button>
    );
};
export default Button;
