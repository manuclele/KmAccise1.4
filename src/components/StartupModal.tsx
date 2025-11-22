
import React from 'react';
import { UpdateIcon } from './Icons';

interface StartupModalProps {
  onUpdate: () => void;
  onClose: () => void;
  lastUpdated: number;
}

const StartupModal: React.FC<StartupModalProps> = ({ onUpdate, onClose, lastUpdated }) => {
  // Se lastUpdated è 0, mostriamo un testo alternativo
  const lastDate = lastUpdated > 0 
    ? new Date(lastUpdated).toLocaleString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : "Nessun salvataggio locale precedente";

  return (
    <div 
        className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm transition-opacity"
        role="dialog"
        aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border-t-4 border-blue-600">
        <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                <UpdateIcon />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Benvenuto!</h2>
            <p className="text-gray-600 mb-6">
                Vuoi aggiornare i dati caricando un file (es. da Google Drive) o continuare con i dati salvati su questo dispositivo?
            </p>

            <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm text-gray-500 border border-gray-200">
                Ultimo salvataggio locale:<br/>
                <span className="font-bold text-gray-700">{lastDate}</span>
            </div>

            <div className="space-y-3">
                <button
                    onClick={onUpdate}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors flex justify-center items-center"
                >
                    <span className="mr-2">📂</span> Sì, Aggiorna da File
                </button>
                
                <button
                    onClick={onClose}
                    className="w-full bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 transition-colors"
                >
                    No, usa dati locali
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StartupModal;
