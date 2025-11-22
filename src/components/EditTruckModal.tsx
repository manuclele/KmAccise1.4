
import React, { useState, useRef, useEffect } from 'react';
import { Truck } from '../types';
import AlertDialog from './AlertDialog';
import SwapCodeModal from './SwapCodeModal';
import { SwitchHorizontalIcon } from './Icons';

interface EditTruckModalProps {
  truck: Truck;
  onClose: () => void;
  onSave: (updatedTruck: Truck) => void;
  onSwapCodes: (truckId1: number, truckId2: number) => void;
  trucks: Truck[]; 
}

const EditTruckModal: React.FC<EditTruckModalProps> = ({ truck, onClose, onSave, onSwapCodes, trucks }) => {
  const [plate, setPlate] = useState(truck.plate);
  const [internalCode, setInternalCode] = useState(truck.internalCode);
  const [initialMileage, setInitialMileage] = useState<number | null>(truck.initialMileage);
  const [notes, setNotes] = useState(truck.notes || '');
  const [isSold, setIsSold] = useState(truck.isSold || false);

  // Stato Dialog
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

  // Stato Swap Modal
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  // Refs
  const plateRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const mileageRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLInputElement>(null);
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

  // --- GESTIONE SWAP ---
  const handleSwapConfirm = (targetTruckId: number) => {
      // Esegui lo scambio
      onSwapCodes(truck.id, targetTruckId);
      setIsSwapModalOpen(false);
      onClose(); // Chiudi la finestra di modifica principale per aggiornare la vista
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

    if (!plate.trim()) return showDialog("Dati Mancanti", "La Targa è obbligatoria.", 'alert');
    if (!internalCode.trim()) return showDialog("Dati Mancanti", "Il Codice Interno è obbligatorio.", 'alert');
    if (initialMileage === null) return showDialog("Dati Mancanti", "Il Chilometraggio Iniziale è obbligatorio.", 'alert');
    if (initialMileage < 0) return showDialog("Errore Dati", "Il chilometraggio iniziale non può essere negativo.", 'alert');

    checkPlateDuplication();
  };

  // Step 1: Targa
  const checkPlateDuplication = () => {
    const duplicatePlateTruck = trucks.find(t => t.id !== truck.id && t.plate.replace(/\s/g, '') === plate.replace(/\s/g, ''));
    
    if (duplicatePlateTruck) {
        showDialog(
            "Targa Duplicata",
            `La targa ${plate} è già presente sul veicolo con Codice: ${duplicatePlateTruck.internalCode}.\n\nVuoi forzare il salvataggio per permettere lo scambio?`,
            'confirm',
            () => { closeDialog(); checkCodeDuplication(); }
        );
    } else {
        checkCodeDuplication();
    }
  };

  // Step 2: Codice (Rigido, salvo venduti)
  const checkCodeDuplication = () => {
    if (!isSold) {
        // Controllo rigoroso: se esiste un altro veicolo attivo con lo stesso codice, è ERRORE.
        const duplicateActiveCodeTruck = trucks.find(t => 
            t.id !== truck.id && 
            t.internalCode.trim().toUpperCase() === internalCode.trim().toUpperCase() && 
            t.isSold !== true
        );

        if (duplicateActiveCodeTruck) {
            showDialog(
                "Codice Duplicato",
                `ERRORE: Il codice "${internalCode}" è già in uso sul veicolo: ${duplicateActiveCodeTruck.plate}.\n\nUsa il pulsante "Scambia" se vuoi invertire i codici.`,
                'alert'
            );
        } else {
            performSave();
        }
    } else {
        // Se questo veicolo è venduto, può avere qualsiasi codice
        performSave();
    }
  };

  // Step 3: Salva
  const performSave = () => {
    onSave({ 
        ...truck, 
        plate, 
        internalCode, 
        initialMileage,
        notes: notes.trim() === '' ? undefined : notes.trim(),
        isSold
    });
    onClose();
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

        {/* Modale Scambio Codici */}
        {isSwapModalOpen && (
            <SwapCodeModal 
                currentTruckId={truck.id}
                currentCode={internalCode}
                trucks={trucks}
                onClose={() => setIsSwapModalOpen(false)}
                onConfirmSwap={handleSwapConfirm}
            />
        )}

        {/* Modale Modifica */}
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
                ref={plateRef}
                id="plate"
                type="text"
                value={plate}
                onChange={handlePlateChange}
                onKeyDown={(e) => handleKeyDown(e, codeRef)}
                className={inputClasses}
                />
            </div>
            
            <div className="mb-4">
                <label htmlFor="internalCode" className="block text-gray-700 text-sm font-bold mb-2">Codice Interno *</label>
                <div className="flex space-x-2">
                    <input
                        ref={codeRef}
                        id="internalCode"
                        type="text"
                        value={internalCode}
                        onChange={(e) => setInternalCode(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, mileageRef)}
                        className={inputClasses}
                    />
                    <button
                        type="button"
                        onClick={() => setIsSwapModalOpen(true)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-3 rounded-md border border-blue-200 flex items-center transition-colors"
                        title="Scambia codice con un altro veicolo"
                    >
                        <SwitchHorizontalIcon className="h-5 w-5" />
                        <span className="hidden sm:inline ml-1 text-xs uppercase">Scambia</span>
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="initialMileage" className="block text-gray-700 text-sm font-bold mb-2">Chilometri Iniziali (al 01/01) *</label>
                <input
                ref={mileageRef}
                id="initialMileage"
                type="number"
                min="0"
                value={initialMileage ?? ''}
                onChange={(e) => setInitialMileage(e.target.value ? parseInt(e.target.value, 10) : null)}
                onKeyDown={(e) => handleKeyDown(e, isSold ? submitBtnRef : notesRef)}
                className={inputClasses}
                />
            </div>

            {/* Checkbox Venduto */}
            <div className="mb-4 flex items-center">
                <input
                id="isSold"
                type="checkbox"
                checked={isSold}
                onChange={(e) => setIsSold(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isSold" className="ml-2 text-sm font-bold text-gray-700">
                Veicolo Venduto
                </label>
            </div>

            {!isSold && (
                <div className="mb-8">
                    <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">Altre Note</label>
                    <input
                    ref={notesRef}
                    id="notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, submitBtnRef)}
                    className={inputClasses}
                    placeholder="es. Note varie"
                    />
                </div>
            )}

            <div className="flex items-center justify-end space-x-4 mt-6">
                <button
                type="button"
                onClick={onClose}
                className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                >
                Annulla
                </button>
                <button
                ref={submitBtnRef}
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                Salva Modifiche
                </button>
            </div>
            </form>
        </div>
        </div>
    </>
  );
};

export default EditTruckModal;
