
import React from 'react';
import { WarningIcon, ErrorIcon } from './Icons';

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'alert' | 'confirm'; // 'alert' ha solo OK, 'confirm' ha Annulla/Conferma
  onConfirm: () => void;
  onClose: () => void; // Usato per chiudere o annullare
}

const AlertDialog: React.FC<AlertDialogProps> = ({ isOpen, title, message, type, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-[60] backdrop-blur-sm transition-opacity"
        role="dialog"
        aria-modal="true"
    >
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all border border-gray-100 mx-4">
        <div className="flex flex-col items-center text-center">
            <div className="mb-4">
                {type === 'confirm' ? <WarningIcon /> : <ErrorIcon />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6 whitespace-pre-line leading-relaxed">
                {message}
            </p>
            
            <div className="flex w-full space-x-3">
                {type === 'confirm' && (
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 transition-colors focus:ring-2 focus:ring-gray-200 outline-none"
                    >
                        Annulla
                    </button>
                )}
                <button
                    onClick={() => {
                        onConfirm();
                        if (type === 'alert') onClose(); // Se è solo alert, chiude anche
                    }}
                    className={`flex-1 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-transform active:scale-95 outline-none focus:ring-2 focus:ring-offset-1 ${
                        type === 'confirm' 
                        ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400' 
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                >
                    {type === 'confirm' ? 'Conferma' : 'OK'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
