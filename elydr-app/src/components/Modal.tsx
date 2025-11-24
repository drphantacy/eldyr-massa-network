'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
}: ModalProps) {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'warning':
        return { icon: '⚠️', color: 'border-yellow-500', bgColor: 'bg-yellow-900/20' };
      case 'success':
        return { icon: '✅', color: 'border-green-500', bgColor: 'bg-green-900/20' };
      case 'error':
        return { icon: '❌', color: 'border-red-500', bgColor: 'bg-red-900/20' };
      default:
        return { icon: 'ℹ️', color: 'border-mythic-cyan', bgColor: 'bg-mythic-cyan/20' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className={`relative bg-cosmic-900 border-2 ${color} rounded-2xl shadow-2xl max-w-md w-full overflow-hidden`}>
        <div className={`absolute inset-0 ${bgColor} pointer-events-none`} />

        <div className="relative p-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-cosmic-800 flex items-center justify-center text-4xl">
              {icon}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white text-center mb-3">
            {title}
          </h3>

          <p className="text-cosmic-300 text-center mb-6">
            {message}
          </p>

          <div className="flex gap-3">
            {showCancel && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-cosmic-800 hover:bg-cosmic-700 text-white font-medium rounded-xl transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`flex-1 px-6 py-3 font-medium rounded-xl transition-all ${
                type === 'warning' || type === 'error'
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white hover:opacity-90'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
