
import React, { useState, useRef, useEffect } from 'react';
import { Truck } from '../types';
import AlertDialog from './AlertDialog';

interface AddTruckModalProps {
  onClose: () => void;
  onAdd: (newTruckData: Omit<Truck, 'id' | 'quarterEndMileage'>) => void;
  trucks: Truck[];
}

const AddTruckModal: React.FC<AddTruckModalProps> = ({ onClose, onAdd, trucks }) => {
  const [plate, setPlate] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [initialMileage, setInitialMileage] = useState<number | null>(null);

  // Stato per la gestione del Dialog personalizzato
  const [dialogState, setDialogState] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      type: 'alert' | 'confirm';
      onConfirm: () => void;
  }>({
      isOpen: false,
      title: '',
      message: '',
      type: 'alert',
      onConfirm: () => {},
  });

  // Refs
  const plateRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const mileageRef = useRef<HTMLInputElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
      setTimeout(() => {
          plateRef.current?.focus();
      }, 50);
  }, []);

  const formatPlate = (value: string) => {
    let clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length === 7 && /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/.test(clean)) {
        return `${clean.substring(0, 2)} ${clean.substring(2, 5)} ${clean.substring(5, 7)}`;
    }
    return clean;
  };

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPlate(formatPlate(e.target.value));
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLElement | null>) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          nextRef.current?.focus();
      }
  };

  // --- SISTEMA DI VALIDAZIONE A STEP ---

  const showDialog = (title: string, message: string, type: 'alert' | 'confirm', onConfirm: () => void = () => {}) => {
      setDialogState({ isOpen: true, title, message, type, onConfirm });
  };

  const closeDialog = () => {
      setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // VALIDAZIONE CAMPI
    if (!plate.trim()) return showDialog("Dati Mancanti", "La Targa è obbligatoria.", 'alert');
    if (!internalCode.trim()) return showDialog("Dati Mancanti", "Il Codice Interno è obbligatorio.", 'alert');
    if (initialMileage === null) return showDialog("Dati Mancanti", "Il Chilometraggio Iniziale è obbligatorio.", 'alert');
    if (initialMileage < 0) return showDialog("Errore Dati", "Il chilometraggio iniziale non può essere negativo.", 'alert');

    // Avvio catena controlli
    checkPlateDuplication();
  };

  // Step 1: Controllo Targa
  const checkPlateDuplication = () => {
    const duplicatePlateTruck = trucks.find(t => t.plate.replace(/\s/g, '') === plate.replace(/\s/g, ''));
    
    if (duplicatePlateTruck) {
        showDialog(
            "Targa Duplicata",
            `La targa ${plate} è già assegnata al veicolo con Codice: ${duplicatePlateTruck.internalCode}.\n\nVuoi forzare il salvataggio per permettere lo scambio?`,
            'confirm',
            () => { closeDialog(); checkCodeDuplication(); } // Se conferma, passa al controllo codice
        );
    } else {
        checkCodeDuplication(); // Nessun duplicato targa, passa al codice
    }
  };

  // Step 2: Controllo Codice (Rigido, salvo venduti)
  const checkCodeDuplication = () => {
    // Cerca un duplicato che SIA attivo (NOT sold).
    const duplicateActiveCodeTruck = trucks.find(t => 
        t.internalCode.trim().toUpperCase() === internalCode.trim().toUpperCase() && 
        t.isSold !== true
    );

    if (duplicateActiveCodeTruck) {
        // ERRORE BLOCCANTE (Non Confirm)
        showDialog(
            "Codice Duplicato",
            `ERRORE: Il codice "${internalCode}" è già in uso sul veicolo targato: ${duplicateActiveCodeTruck.plate}.\n\nImpossibile assegnare due veicoli attivi allo stesso codice.`,
            'alert'
        );
    } else {
        performAdd(); 
    }
  };

  // Step 3: Salvataggio Effettivo
  const performAdd = () => {
      if (plate && internalCode && initialMileage !== null) {
        onAdd({ plate, internalCode, initialMileage });
        onClose();
      }
  };

  const inputClasses = "appearance-none border-b-2 border-gray-300 bg-sky-50/50 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-0 focus:border-blue-500";

  return (
    <>
        {/* Dialogo Personalizzato */}
        <AlertDialog 
            isOpen={dialogState.isOpen}
            title={dialogState.title}
            message={dialogState.message}
            type={dialogState.type}
            onConfirm={dialogState.onConfirm}
            onClose={closeDialog}
        />

        {/* Modale Principale */}
        <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-truck-modal-title"
        >
        <div 
            className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all"
            onClick={e => e.stopPropagation()} 
        >
            <h2 id="add-truck-modal-title" className="text-2xl font-bold mb-6 text-gray-900">Aggiungi Nuovo Veicolo</h2>
            <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="plate" className="block text-gray-700 text-sm font-bold mb-2">Targa *</label>
                <input
                ref={plateRef}
                id="plate"
                type="text"
                value={plate}
                onChange={handlePlateChange}
                onKeyDown={(e) => handleKeyDown(e, codeRef)}
                className={inputClasses}
                placeholder="AA 000 AA"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="internalCode" className="block text-gray-700 text-sm font-bold mb-2">Codice Interno *</label>
                <input
                ref={codeRef}
                id="internalCode"
                type="text"
                value={internalCode}
                onChange={(e) => setInternalCode(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, mileageRef)}
                className={inputClasses}
                />
            </div>
            <div className="mb-8">
                <label htmlFor="initialMileage" className="block text-gray-700 text-sm font-bold mb-2">Chilometri Iniziali (al 01/01) *</label>
                <input
                ref={mileageRef}
                id="initialMileage"
                type="number"
                min="0"
                value={initialMileage ?? ''}
                onChange={(e) => setInitialMileage(e.target.value ? parseInt(e.target.value, 10) : null)}
                onKeyDown={(e) => handleKeyDown(e, submitBtnRef)}
                className={inputClasses}
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
                ref={submitBtnRef}
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                >
                Aggiungi Veicolo
                </button>
            </div>
            </form>
        </div>
        </div>
    </>
  );
};

export default AddTruckModal;
