import React, { useState } from 'react';
import { Truck } from '../types';

interface EditTruckModalProps {
  truck: Truck;
  onClose: () => void;
  onSave: (updatedTruck: Truck) => void;
}

const EditTruckModal: React.FC<EditTruckModalProps> = ({ truck, onClose, onSave }) => {
  const [plate, setPlate] = useState(truck.plate);
  const [internalCode, setInternalCode] = useState(truck.internalCode);
  const [initialMileage, setInitialMileage] = useState<number | null>(truck.initialMileage);
  const [notes, setNotes] = useState(truck.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialMileage !== null && initialMileage < 0) {
      alert('Il chilometraggio iniziale non può essere negativo.');
      return;
    }
    if (plate && initialMileage !== null) {
      onSave({ 
          ...truck, 
          plate, 
          internalCode, 
          initialMileage,
          notes: notes.trim() === '' ? undefined : notes.trim(),
      });
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
        aria-labelledby="edit-truck-modal-title"
    >
      <div 
        className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="edit-truck-modal-title" className="text-2xl font-bold mb-6 text-gray-900">Modifica Veicolo</h2>
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
          <div className="mb-4">
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
          <div className="mb-8">
            <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">Note</label>
            <input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClasses}
              placeholder="es. (VENDUTO)"
            />
          </div>
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            >
              Salva Modifiche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTruckModal;