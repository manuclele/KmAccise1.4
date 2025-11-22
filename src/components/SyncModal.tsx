import React, { useState, useRef } from 'react';
import { Truck } from '../types';
import { DownloadIcon, UploadIcon, ClipboardIcon, ClipboardCheckIcon } from './Icons';

export interface BackupFile {
    meta: {
        version: number;
        timestamp: number;
        year?: number; // Deprecato in v2
        companyName?: string;
    };
    data?: Truck[]; // Legacy v1
    datasets?: Record<string, Truck[]>; // v2 (multi anno)
}

interface SyncModalProps {
  onClose: () => void;
  onImport: (file: BackupFile) => void;
  trucks: Truck[];
  year: number;
  lastUpdated: number;
  companyName: string;
}

const formatDate = (timestamp: number) => {
    if (timestamp === 0) return "Nessun dato";
    return new Date(timestamp).toLocaleString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const SyncModal: React.FC<SyncModalProps> = ({ onClose, onImport, trucks, year, lastUpdated, companyName }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('file'); // Default su File ora
  const [textData, setTextData] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prepara il pacchetto dati MULTI ANNO
  const createBackupPackage = (): BackupFile => {
    const datasets: Record<string, Truck[]> = {};
    
    // 1. Recupera TUTTE le chiavi presenti nel LocalStorage
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
        // Filtra solo le chiavi dei dati camion (ignora meta e altri dati)
        if (key.startsWith('trucks_') && !key.startsWith('trucks_meta_')) {
            const yearKey = key.replace('trucks_', '');
            
            // Leggi dal storage
            try {
                const rawData = localStorage.getItem(key);
                if (rawData) {
                    datasets[yearKey] = JSON.parse(rawData);
                }
            } catch (e) {
                console.warn(`Errore lettura anno ${yearKey}`, e);
            }
        }
    });

    // 2. Sovrascrivi l'anno corrente con lo stato attuale (che contiene le modifiche non ancora persistite o più recenti)
    // Questo assicura che se sto modificando il 2025, salvo la versione a schermo, non quella vecchia su disco
    datasets[year.toString()] = trucks;

    return {
        meta: {
            version: 2,
            timestamp: Date.now(),
            companyName: companyName
        },
        datasets: datasets
    };
  };

  // --- LOGICA COMUNE IMPORT ---
  const processImport = (jsonData: any) => {
      let finalData: BackupFile;

      // Supporto retrocompatibilità
      if (Array.isArray(jsonData)) {
          if(!window.confirm("⚠️ File formato vecchio (array). Tratto come anno corrente?")) return;
          finalData = {
              meta: { version: 1, timestamp: Date.now(), year },
              datasets: { [year.toString()]: jsonData }
          };
      } else if (jsonData.meta && jsonData.data) {
          // Formato v1
          const fileYear = jsonData.meta.year || year;
          finalData = {
              ...jsonData,
              datasets: { [fileYear.toString()]: jsonData.data }
          };
      } else if (jsonData.meta && jsonData.datasets) {
          // Formato v2 OK
          finalData = jsonData as BackupFile;
      } else {
          alert("Formato file non riconosciuto.");
          return;
      }

      // Controllo Timestamp
      const fileTime = finalData.meta.timestamp;
      if (lastUpdated > 0 && fileTime < lastUpdated) {
           const confirmed = window.confirm(
               `ATTENZIONE ⚠️\n\n` +
               `Il backup è più vecchio dei dati attuali!\n` +
               `File: ${formatDate(fileTime)}\n` +
               `Attuali: ${formatDate(lastUpdated)}\n\n` +
               `Continuare?`
           );
           if (!confirmed) return;
      } else if (lastUpdated > 0 && fileTime > lastUpdated) {
            const confirmed = window.confirm(
               `AGGIORNAMENTO TROVATO ✅\n\n` +
               `Data File: ${formatDate(fileTime)}\n\n` +
               `Caricare i nuovi dati?`
            );
            if (!confirmed) return;
      }

      onImport(finalData);
      onClose();
  };


  // --- LOGICA TESTO (Copia/Incolla) ---
  const handleCopy = async () => {
    const backup = createBackupPackage();
    const dataStr = JSON.stringify(backup);
    try {
      await navigator.clipboard.writeText(dataStr);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
      const textArea = document.createElement("textarea");
      textArea.value = dataStr;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) { /* ignore */ }
      document.body.removeChild(textArea);
    }
  };

  const handlePasteImport = () => {
    try {
      if (!textData.trim()) {
        alert("Incolla prima il codice nel riquadro.");
        return;
      }
      const parsed = JSON.parse(textData);
      processImport(parsed);
    } catch (e) {
      alert("Errore: Il testo incollato non è un formato valido.");
    }
  };


  // --- LOGICA FILE ---
  const handleDownloadFile = async () => {
    const backup = createBackupPackage();
    const dataStr = JSON.stringify(backup, null, 2);
    const suggestedName = `backup_completo_camion.json`;

    try {
        // @ts-ignore
        if (window.showSaveFilePicker) {
            // @ts-ignore
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: suggestedName,
                types: [{
                    description: 'JSON File',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            
            const writable = await fileHandle.createWritable();
            await writable.write(dataStr);
            await writable.close();
        } else {
            throw new Error("API not supported");
        }
    } catch (err: any) {
        if (err.name !== 'AbortError') {
             const blob = new Blob([dataStr], { type: 'application/json' });
             const url = URL.createObjectURL(blob);
             const link = document.createElement('a');
             link.href = url;
             link.download = suggestedName;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             URL.revokeObjectURL(url);
        }
    }
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedData = JSON.parse(content);
        processImport(parsedData);
      } catch (error) {
        alert("Errore nella lettura del file.");
      }
      e.target.value = ''; 
    };
    reader.readAsText(file);
  };

  return (
    <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 transition-opacity"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modale */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Sincronizza con Drive</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Ultima modifica locale: <strong>{formatDate(lastUpdated)}</strong>
            </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
            <button 
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'file' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('file')}
            >
                📂 File (Drive)
            </button>
            <button 
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'text' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('text')}
            >
                📱 Copia/Incolla
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            
            {/* CONTENUTO TAB FILE */}
            {activeTab === 'file' && (
                <div className="space-y-6">
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-yellow-800 mb-4">
                        <strong>Consiglio:</strong> Seleziona la tua cartella <em>Google Drive</em> nella finestra che si aprirà.
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="relative">
                             <p className="text-sm font-bold text-gray-700 mb-2">1. Vuoi AGGIORNARE questo dispositivo?</p>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept=".json"
                                onChange={handleUploadFile}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 font-bold py-3 px-4 rounded-lg transition"
                            >
                                <UploadIcon />
                                <span className="ml-2">Apri da Drive (Aggiorna)</span>
                            </button>
                        </div>

                        <hr className="border-gray-200" />

                        <div>
                             <p className="text-sm font-bold text-gray-700 mb-2">2. Vuoi SALVARE le modifiche fatte qui?</p>
                            <button
                                onClick={handleDownloadFile}
                                className="w-full flex items-center justify-center bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 font-bold py-3 px-4 rounded-lg transition"
                            >
                                <DownloadIcon />
                                <span className="ml-2">Salva tutto (su Drive)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENUTO TAB TESTO */}
            {activeTab === 'text' && (
                <div className="space-y-6">
                    <p className="text-sm text-gray-600">
                        Metodo alternativo per WhatsApp/Email se i file sono scomodi.
                    </p>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-900 text-sm mb-2">Esporta Codice</h4>
                        <button 
                            onClick={handleCopy}
                            className={`w-full flex items-center justify-center py-2 px-4 rounded transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50'}`}
                        >
                            {copySuccess ? <ClipboardCheckIcon /> : <ClipboardIcon />}
                            <span className="ml-2 font-bold">{copySuccess ? 'Copiato!' : 'Copia Codice'}</span>
                        </button>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-bold text-gray-800 text-sm mb-2">Importa Codice</h4>
                        <textarea 
                            className="w-full h-24 p-2 border border-gray-300 rounded text-xs font-mono bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Incolla qui il codice..."
                            value={textData}
                            onChange={(e) => setTextData(e.target.value)}
                        />
                        <button 
                            onClick={handlePasteImport}
                            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            Carica
                        </button>
                    </div>
                </div>
            )}
        </div>
        
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
             <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2"
             >
                Chiudi
             </button>
        </div>
      </div>
    </div>
  );
};

export default SyncModal;