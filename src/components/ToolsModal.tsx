
import React, { useState } from 'react';
import { ArchiveIcon, SparklesIcon, TrashIcon, CogIcon } from './Icons';
import AlertDialog from './AlertDialog';

interface ToolsModalProps {
  onClose: () => void;
  onImportPreviousYear: () => boolean;
  onResetMileages: () => void;
  onClearAll: () => void;
  year: number;
}

const ToolsModal: React.FC<ToolsModalProps> = ({ onClose, onImportPreviousYear, onResetMileages, onClearAll, year }) => {
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

  const showDialog = (title: string, message: string, type: 'alert' | 'confirm', onConfirm: () => void = () => {}) => {
    setDialogState({ isOpen: true, title, message, type, onConfirm });
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const handleImportClick = () => {
      showDialog(
          "Inizializzazione Anno",
          `Vuoi importare i veicoli dall'anno ${year - 1}?\n\n- Verranno importati solo i veicoli NON venduti.\n- I Km finali dell'anno scorso diventeranno i Km Iniziali di quest'anno.\n- I dati attuali verranno sovrascritti.`,
          'confirm',
          () => {
              closeDialog();
              const success = onImportPreviousYear();
              if (success) {
                  setTimeout(() => showDialog("Completato", "Importazione avvenuta con successo.", "alert"), 300);
              } else {
                  setTimeout(() => showDialog("Nessun Dato", `Non ho trovato dati salvati per l'anno ${year - 1}.`, "alert"), 300);
              }
          }
      );
  };

  const handleResetClick = () => {
      showDialog(
          "Conferma Reset Chilometri",
          `Sei sicuro di voler AZZERARE tutti i chilometri inseriti per l'anno ${year}?\n\n- I veicoli rimarranno in lista.\n- I Km iniziali e trimestrali saranno cancellati.\n\nQuesta azione è irreversibile.`,
          'confirm',
          () => {
              onResetMileages();
              closeDialog();
              setTimeout(() => onClose(), 100);
          }
      );
  };

  const handleClearAllClick = () => {
      showDialog(
          "ELIMINAZIONE TOTALE",
          `⚠️ ATTENZIONE ⚠️\n\nStai per eliminare TUTTI i veicoli e i dati per l'anno ${year}.\n\nNon potrai recuperare questi dati se non hai un backup.\nSei assolutamente sicuro?`,
          'confirm',
          () => {
              onClearAll();
              closeDialog();
              setTimeout(() => onClose(), 100);
          }
      );
  };

  return (
    <>
        <AlertDialog 
            isOpen={dialogState.isOpen}
            title={dialogState.title}
            message={dialogState.message}
            type={dialogState.type}
            onConfirm={dialogState.onConfirm}
            onClose={closeDialog}
        />

        <div 
            className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-gray-500 mx-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center mb-6 text-gray-700">
                    <CogIcon className="h-7 w-7 mr-3" />
                    <h3 className="text-2xl font-bold">Strumenti & Manutenzione</h3>
                </div>

                <div className="space-y-6">
                    {/* Sezione 1: Inizializzazione */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Inizializzazione Anno</h4>
                        <button 
                            onClick={handleImportClick}
                            className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-center transition-colors group"
                        >
                            <div className="bg-blue-200 p-2 rounded-full text-blue-700 mr-4 group-hover:bg-blue-300 transition-colors">
                                <ArchiveIcon className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-lg">Importa da Anno Precedente</div>
                                <div className="text-xs text-blue-600">Copia veicoli attivi dal {year - 1} e riporta km.</div>
                            </div>
                        </button>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Sezione 2: Gestione Dati */}
                    <div>
                         <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Zona Pericolo (Reset)</h4>
                         <div className="grid grid-cols-1 gap-3">
                            <button 
                                onClick={handleResetClick}
                                className="w-full bg-white hover:bg-amber-50 border border-gray-300 hover:border-amber-300 text-gray-700 hover:text-amber-700 p-3 rounded-lg flex items-center transition-colors"
                            >
                                <SparklesIcon className="h-5 w-5 mr-3" />
                                <div className="text-left">
                                    <div className="font-bold">Azzera Chilometri</div>
                                    <div className="text-xs text-gray-500">Pulisce i valori, mantiene i veicoli.</div>
                                </div>
                            </button>

                            <button 
                                onClick={handleClearAllClick}
                                className="w-full bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 text-gray-700 hover:text-red-700 p-3 rounded-lg flex items-center transition-colors"
                            >
                                <TrashIcon className="h-5 w-5 mr-3" />
                                <div className="text-left">
                                    <div className="font-bold">Elimina Tutto</div>
                                    <div className="text-xs text-gray-500">Cancella tutti i dati dell'anno corrente.</div>
                                </div>
                            </button>
                         </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Chiudi
                    </button>
                </div>
            </div>
        </div>
    </>
  );
};

export default ToolsModal;
