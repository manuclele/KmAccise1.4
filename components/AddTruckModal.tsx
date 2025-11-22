
import React, { useState } from 'react';
import { Truck } from '../types';

interface AddTruckModalProps {
  onClose: () => void;
  onAdd: (newTruckData: Omit<Truck, 'id' | 'quarterEndMileage'>) => void;
}

const AddTruckModal: React.FC<AddTruckModalProps> = ({ onClose, onAdd }) => {
  const [plate, setPlate] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [initialMileage, setInitialMileage] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialMileage !== null && initialMileage < 0) {
      alert('Il chilometraggio iniziale non può essere negativo.');
      return;
    }
    if (plate && initialMileage !== null) {
      onAdd({ plate, internalCode, initialMileage });
      onClose();
    } else {
      alert('Per favore, compila targa e chilometri iniziali.');
    }
  };

  const inputClasses = "appearance-none border-b-2 border-gray-300 bg-sky-50/50 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-0 focus:border-blue-500";

  return (
    <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-truck-modal-title"
    >
      <div 
        className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 id="add-truck-modal-title" className="text-2xl font-bold mb-6 text-gray-900">Aggiungi Nuovo Veicolo</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="plate" className="block text-gray-700 text-sm font-bold mb-2">Targa *</label>
            <input
              id="plate"
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              className={inputClasses}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="internalCode" className="block text-gray-700 text-sm font-bold mb-2">Codice Interno</label>
            <input
              id="internalCode"
              type="text"
              value={internalCode}
              onChange={(e) => setInternalCode(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="mb-8">
            <label htmlFor="initialMileage" className="block text-gray-700 text-sm font-bold mb-2">Chilometri Iniziali (al 01/01) *</label>
            <input
              id="initialMileage"
              type="number"
              min="0"
              value={initialMileage ?? ''}
              onChange={(e) => setInitialMileage(e.target.value ? parseInt(e.target.value, 10) : null)}
              className={inputClasses}
              required
            />
          </div>
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150 ease-in-out"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Aggiungi Veicolo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTruckModal;