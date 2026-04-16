import React from 'react';

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalSheet: React.FC<ModalSheetProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-secondary/80 backdrop-blur-md pb-4"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalSheet;
