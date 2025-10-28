import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        // Backdrop with Glassmorphism Effect
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center 
                       bg-black/30    // Semi-transparent black background
                       backdrop-blur-sm // ✨ THIS IS THE KEY FOR GLASSMORHISM ✨
                       transition-opacity"
            onClick={onClose} // Close on backdrop click
        >
            {/* Modal Panel */}
            <div 
                className="relative w-full max-w-md p-6 m-4 bg-white rounded-lg shadow-xl"
                onClick={(e) => e.stopPropagation()} // Prevent modal click from closing
            >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
                <div className="text-gray-600 mb-6">
                    {children}
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
