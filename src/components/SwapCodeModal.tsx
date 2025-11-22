
import React, { useState } from 'react';
import { Truck } from '../types';
import { SwitchHorizontalIcon } from './Icons';

interface SwapCodeModalProps {
  currentTruckId: number;
  currentCode: string;
  trucks: Truck[];
  onClose: () => void;
  onConfirmSwap: (targetTruckId: number) => void;
}

const SwapCodeModal: React.FC<SwapCodeModalProps> = ({ currentTruckId, currentCode, trucks, onClose, onConfirmSwap }) => {
  const [selectedTruckId, setSelectedTruckId] = useState<number | null>(null);

  // Filtra i camion disponibili per lo scambio (tutti tranne se stesso e quelli venduti)
  const availableTrucks = trucks
    .filter(t => t.id !== currentTruckId && !t.isSold)
    .sort((a, b) => a.internalCode.localeCompare(b.internalCode, undefined, { numeric: true }));

  const handleConfirm = () => {
    if (selectedTruckId !== null) {
      onConfirmSwap(selectedTruckId);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-[70] backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-blue-600 mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center mb-4 text-blue-700">
            <SwitchHorizontalIcon className="h-6 w-6 mr-2" />
            <h3 className="text-xl font-bold">Scambia Codice</h3>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm">
          Stai per scambiare il codice <strong>{currentCode}</strong> con un altro veicolo.<br/>
          Seleziona il veicolo con cui effettuare lo scambio:
        </p>

        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md mb-6">
            {availableTrucks.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">Nessun altro veicolo attivo disponibile.</div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {availableTrucks.map(truck => (
                        <li 
                            key={truck.id}
                            onClick={() => setSelectedTruckId(truck.id)}
                            className={`p-3 cursor-pointer flex justify-between items-center transition-colors ${
                                selectedTruckId === truck.id 
                                ? 'bg-blue-50 border-l-4 border-blue-500' 
                                : 'hover:bg-gray-50 border-l-4 border-transparent'
                            }`}
                        >
                            <div>
                                <span className="font-bold text-gray-800 mr-3 text-lg">{truck.internalCode}</span>
                                <span className="text-gray-600 text-sm">{truck.plate}</span>
                            </div>
                            {selectedTruckId === truck.id && (
                                <span className="text-blue-600 font-bold text-sm">Selezionato</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedTruckId === null}
            className={`px-4 py-2 rounded-lg text-white font-bold shadow-sm transition-colors ${
                selectedTruckId === null 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Conferma Scambio
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapCodeModal;
