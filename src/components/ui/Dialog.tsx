import React from 'react';
import { Modal, ModalProps } from './Modal';

export interface DialogProps extends Omit<ModalProps, 'footer'> {
  description?: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Close',
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              className="px-3.5 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 focus:outline-none"
            >
              {confirmText}
            </button>
          )}
        </div>
      }
      {...props}
    >
      {description && <p className="text-sm text-gray-600 mb-3">{description}</p>}
      {children}
    </Modal>
  );
};
