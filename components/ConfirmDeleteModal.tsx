import React from 'react';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  truckPlate?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onClose, onConfirm, truckPlate }) => {
  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-modal-title"
    >
      <div 
        className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="confirm-delete-modal-title" className="text-2xl font-bold mb-4 text-gray-900">Conferma Eliminazione</h2>
        <p className="text-gray-700 mb-6">
          Sei sicuro di voler eliminare il veicolo <strong>{truckPlate || ''}</strong>? <br/>
          L'azione è irreversibile.
        </p>
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
