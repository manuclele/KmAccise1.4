import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Truck } from './types';
import Header from './components/Header';
import TotalsRow from './components/TotalsRow';
import TruckRow from './components/TruckRow';
import AddTruckModal from './components/AddTruckModal';
import EditTruckModal from './components/EditTruckModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import StartupModal from './components/StartupModal';
import ToolsModal from './components/ToolsModal';
import { SortAscendingIcon, SortDescendingIcon } from './components/Icons';

// This data is used as a one-time seed if no saved data is found for the initial year.
const initialSeedData: Truck[] = [
  { id: 1, internalCode: '855', plate: 'GG 949 BC', initialMileage: 227499, quarterEndMileage: [250363, 280752, 314144, null] },
  { id: 2, internalCode: '655', plate: 'GB 916 JS', initialMileage: 466599, quarterEndMileage: [491723, 522254, 553898, null] },
  { id: 3, internalCode: '866', plate: 'GK 808 JA', initialMileage: 172375, quarterEndMileage: [199985, 224562, 248364, null] },
  { id: 4, internalCode: '755', plate: 'GB 941 JS', initialMileage: 410398, quarterEndMileage: [435176, 468358, 502693, null] },
  { id: 5, internalCode: '155', plate: 'FC 349 YW', initialMileage: 810871, quarterEndMileage: [828211, 851711, 873551, null] },
  { id: 6, internalCode: '856', plate: 'FB 841 FP', initialMileage: 997918, quarterEndMileage: [1007587, 1027385, 1044400, null] },
  { id: 7, internalCode: '455', plate: 'EV 134 PN', isSold: true, initialMileage: 912084, quarterEndMileage: [924371, null, null, null] },
];
const SEED_YEAR = new Date().getFullYear();

type SortKey = 'internalCode' | 'plate';
type SortDirection = 'ascending' | 'descending';

export interface BackupFile {
    meta: {
        version: number;
        timestamp: number;
        year?: number; // Deprecato in v2
        companyName?: string;
    };
    data?: Truck[]; // Legacy v1 (singolo anno)
    datasets?: Record<string, Truck[]>; // v2 (multi anno): "2024": [...], "2025": [...]
}

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const App: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [companyName, setCompanyName] = useState('');
  const [trucks, setTrucks] = useState<Truck[]>([]); 
  const [lastUpdated, setLastUpdated] = useState<number>(0); // 0 indica "nessun dato salvato" o "vergine"
  const [isAppClosed, setIsAppClosed] = useState(false); 
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false); 
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);

  const [truckToDeleteId, setTruckToDeleteId] = useState<number | null>(null);
  const [truckToEdit, setTruckToEdit] = useState<Truck | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: SortDirection }>({ key: null, direction: 'ascending' });
  
  // PWA Installation State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const isInitialMount = useRef(true);
  const isStartupCheckDone = useRef(false);
  const ignoreNextSave = useRef(false); // Nuovo flag per evitare salvataggi non necessari al boot
  const inputRefs = useRef(new Map<string, HTMLInputElement>());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        setDeferredPrompt(null);
    }
  };

  // Load Company Name
  useEffect(() => {
      const savedCompany = localStorage.getItem('companyName');
      if (savedCompany) setCompanyName(savedCompany);
  }, []);

  // Save Company Name
  useEffect(() => {
      localStorage.setItem('companyName', companyName);
  }, [companyName]);

  // Load trucks from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(`trucks_${year}`);
      const savedMeta = localStorage.getItem(`trucks_meta_${year}`);
      
      if (savedData) {
        setTrucks(JSON.parse(savedData));
        ignoreNextSave.current = true; // Evita che il caricamento dei dati esistenti aggiorni il timestamp a "adesso"
        if (savedMeta) {
            setLastUpdated(parseInt(savedMeta, 10));
        } else {
            setLastUpdated(0);
        }
      } else {
        setTrucks(year === SEED_YEAR ? initialSeedData : []);
        ignoreNextSave.current = true; // Evita che il caricamento dei dati seed aggiorni il timestamp a "adesso"
        setLastUpdated(0); 
      }

      if (!isStartupCheckDone.current) {
          setIsStartupModalOpen(true);
          isStartupCheckDone.current = true;
      }

    } catch (e) {
      console.error("Failed to parse trucks data from localStorage", e);
      setTrucks(year === SEED_YEAR ? initialSeedData : []);
      ignoreNextSave.current = true;
      setLastUpdated(0);
    }
  }, [year]);

  // Save trucks to localStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Se il flag è attivo, saltiamo questo salvataggio automatico e resettiamo il flag
    if (ignoreNextSave.current) {
        ignoreNextSave.current = false;
        return;
    }
    
    localStorage.setItem(`trucks_${year}`, JSON.stringify(trucks));
    const now = Date.now();
    localStorage.setItem(`trucks_meta_${year}`, now.toString());
    setLastUpdated(now);
  }, [trucks, year]);

  const sortedTrucks = useMemo(() => {
    const sortableTrucks = [...trucks];
    if (sortConfig.key) {
        sortableTrucks.sort((a, b) => {
            const aVal = a[sortConfig.key!];
            const bVal = b[sortConfig.key!];
            
            const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
            
            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        });
    }
    return sortableTrucks;
  }, [trucks, sortConfig]);

  const inputOrder = useMemo(() => {
    const order: string[] = [];
    sortedTrucks.forEach(truck => {
      order.push(`${truck.id}-initial`); 
      for (let i = 0; i < 4; i++) {
        order.push(`${truck.id}-q${i}`); 
      }
    });
    return order;
  }, [sortedTrucks]);

  // --- COUNTERS CALCULATION ---
  const counts = useMemo(() => {
      const sold = trucks.filter(t => t.isSold).length;
      // Considera "withNotes" solo i veicoli NON venduti che hanno delle note
      const withNotes = trucks.filter(t => !t.isSold && t.notes && t.notes.trim().length > 0).length;
      // I veicoli attivi sono il totale meno i venduti e meno quelli con note
      const active = trucks.length - sold - withNotes;
      return { active, sold, withNotes };
  }, [trucks]);

  const handleEnterNavigation = (currentKey: string) => {
    const currentInputIndex = inputOrder.findIndex(key => key === currentKey);

    if (currentInputIndex > -1 && currentInputIndex < inputOrder.length - 1) {
      const nextInputKey = inputOrder[currentInputIndex + 1];
      const nextInputElement = inputRefs.current.get(nextInputKey);
      
      if (nextInputElement) {
        nextInputElement.focus();
        nextInputElement.select();
      }
    }
  };

  const setInputRef = (element: HTMLInputElement | null, key: string) => {
    if (element) {
      inputRefs.current.set(key, element);
    } else {
      inputRefs.current.delete(key);
    }
  };

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleAddTruck = (newTruckData: Omit<Truck, 'id' | 'quarterEndMileage'>) => {
    setTrucks(currentTrucks => [
      ...currentTrucks,
      {
        ...newTruckData,
        id: Date.now(),
        quarterEndMileage: [null, null, null, null],
      }
    ]);
  };

  const handleUpdateTruck = (updatedTruck: Truck) => {
    setTrucks(currentTrucks => currentTrucks.map(t => t.id === updatedTruck.id ? updatedTruck : t));
  };

  const handleRequestDelete = (id: number) => {
    setTruckToDeleteId(id);
  };
  
  const handleConfirmDelete = () => {
    if (truckToDeleteId === null) return;
    setTrucks(currentTrucks => currentTrucks.filter(t => t.id !== truckToDeleteId));
    setTruckToDeleteId(null);
  };

  const handleCancelDelete = () => {
    setTruckToDeleteId(null);
  }

  const handleRequestEdit = (truck: Truck) => {
    setTruckToEdit(truck);
  };

  const handleCancelEdit = () => {
    setTruckToEdit(null);
  };
  
  const handleSaveTruck = (updatedTruck: Truck) => {
    handleUpdateTruck(updatedTruck);
    setTruckToEdit(null);
  };

  const handleSwapCodes = (truckId1: number, truckId2: number) => {
    setTrucks(prevTrucks => {
        const t1 = prevTrucks.find(t => t.id === truckId1);
        const t2 = prevTrucks.find(t => t.id === truckId2);

        if (!t1 || !t2) return prevTrucks;

        const code1 = t1.internalCode;
        const code2 = t2.internalCode;

        return prevTrucks.map(t => {
            if (t.id === truckId1) return { ...t, internalCode: code2 };
            if (t.id === truckId2) return { ...t, internalCode: code1 };
            return t;
        });
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // --- STRUMENTI & MANUTENZIONE ---

  const handleImportPreviousYear = (): boolean => {
      const prevYear = year - 1;
      const savedData = localStorage.getItem(`trucks_${prevYear}`);
      
      if (!savedData) {
          return false;
      }
      
      try {
          const prevTrucks: Truck[] = JSON.parse(savedData);
          const baseId = Date.now(); 
          
          const newTrucks: Truck[] = prevTrucks
              .filter(t => !t.isSold)
              .map((t, index) => {
                  let lastValidMileage = t.initialMileage;
                  for (let i = 3; i >= 0; i--) {
                      if (t.quarterEndMileage[i] !== null && t.quarterEndMileage[i] !== undefined) {
                          lastValidMileage = t.quarterEndMileage[i];
                          break;
                      }
                  }

                  return {
                      ...t,
                      id: baseId + index, // Nuovi ID
                      initialMileage: lastValidMileage,
                      quarterEndMileage: [null, null, null, null],
                      isSold: false,
                      notes: t.notes
                  };
              });

          setTrucks(newTrucks);
          return true;

      } catch (e) {
          console.error("Errore importazione anno precedente", e);
          return false;
      }
  };

  const handleResetMileages = () => {
      setTrucks(current => current.map(t => ({
          ...t,
          initialMileage: null,
          quarterEndMileage: [null, null, null, null]
      })));
  };

  const handleClearAll = () => {
      setTrucks([]);
  };

  // --- LOGICA FILE SYSTEM (MULTI-ANNO) ---

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

  const handleSaveAndClose = async () => {
      const backup = createBackupPackage();
      const dataStr = JSON.stringify(backup, null, 2);
      const suggestedName = `backup_completo_camion.json`;
      let success = false;

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
            success = true;
        } else {
             const blob = new Blob([dataStr], { type: 'application/json' });
             const url = URL.createObjectURL(blob);
             const link = document.createElement('a');
             link.href = url;
             link.download = suggestedName;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             URL.revokeObjectURL(url);
             success = true;
        }
    } catch (err: any) {
        if (err.name !== 'AbortError') {
            console.error(err);
            alert("Errore durante il salvataggio.");
        }
        return; 
    }

    if (success) {
        setIsAppClosed(true);
    }
  };

  const handleUpdateClick = () => {
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; 
          fileInputRef.current.click();
      }
      setIsStartupModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedData = JSON.parse(content);
        processImport(parsedData);
      } catch (error) {
        alert("Errore nella lettura del file. Assicurati sia un file JSON valido.");
      }
    };
    reader.readAsText(file);
  };

  const processImport = (jsonData: any) => {
      let backupData: BackupFile;

      // --- NORMALIZZAZIONE FORMATO ---
      if (Array.isArray(jsonData)) {
          // VECCHIO FORMATO (Solo Array) -> Lo trattiamo come dati dell'anno CORRENTE
          if(!window.confirm("⚠️ File formato vecchio (solo dati anno corrente). Importare nell'anno visualizzato?")) return;
          
          const currentYearStr = year.toString();
          backupData = {
              meta: { version: 1, timestamp: Date.now(), year },
              datasets: { [currentYearStr]: jsonData }
          };
      } else if (jsonData.meta && jsonData.data) {
           // FORMATO V1 (Singolo Anno in .data)
           backupData = jsonData as BackupFile;
           const fileYear = backupData.meta.year || year;
           // Convertiamo in V2
           backupData.datasets = {
               [fileYear.toString()]: backupData.data!
           };
      } else if (jsonData.meta && jsonData.datasets) {
           // FORMATO V2 (Multi Anno)
           backupData = jsonData as BackupFile;
      } else {
          alert("Formato file non riconosciuto.");
          return;
      }

      // --- CONTROLLO TIMESTAMP ---
      const fileTime = backupData.meta.timestamp;
      if (lastUpdated > 0 && fileTime < lastUpdated - 1000) {
          const confirmed = window.confirm(
              `⚠️ ATTENZIONE: DATI VECCHI ⚠️\n\n` +
              `Il file selezionato è PIÙ VECCHIO dell'ultimo salvataggio!\n` +
              `📅 File: ${formatDate(fileTime)}\n` +
              `📅 Attuali: ${formatDate(lastUpdated)}\n\n` +
              `Sovrascrivendo perderai le modifiche recenti. Sei sicuro?`
          );
          if (!confirmed) return;
      }

      // --- ESECUZIONE IMPORT ---
      if (backupData.datasets) {
          let currentYearUpdated = false;
          const newTime = backupData.meta.timestamp || Date.now();

          Object.entries(backupData.datasets).forEach(([yearKey, yearData]) => {
              // Salva ogni anno trovato nel file nel localStorage
              localStorage.setItem(`trucks_${yearKey}`, JSON.stringify(yearData));
              localStorage.setItem(`trucks_meta_${yearKey}`, newTime.toString());
              
              // Se l'anno importato è quello che stiamo guardando, aggiorniamo la vista
              if (parseInt(yearKey) === year) {
                  setTrucks(yearData);
                  currentYearUpdated = true;
              }
          });

          if (backupData.meta.companyName) {
              setCompanyName(backupData.meta.companyName);
              localStorage.setItem('companyName', backupData.meta.companyName);
          }

          if (currentYearUpdated) {
            setLastUpdated(newTime);
            ignoreNextSave.current = true; 
          }
          
          alert(`Dati ripristinati con successo! (${Object.keys(backupData.datasets).length} anni aggiornati)`);
      }
  };


  const quarterHeaders = useMemo(() => {
    const shortYear = year.toString().slice(-2);
    return [
      `31/03/${shortYear}`,
      `30/06/${shortYear}`,
      `30/09/${shortYear}`,
      `31/12/${shortYear}`,
    ];
  }, [year]);

  if (isAppClosed) {
      return (
          <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center font-sans">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-8 border-emerald-500 transform transition-all">
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Dati Salvati Correttamente!</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                      Puoi ora uscire dall'applicazione in sicurezza.
                  </p>
                  
                  <div className="text-sm text-gray-400 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="mb-2 font-semibold">Come uscire:</p>
                      <ul className="list-disc list-inside space-y-1 text-left pl-2">
                          <li>Premi il tasto <strong>Home</strong> del telefono.</li>
                          <li>Oppure chiudi questa scheda del browser.</li>
                      </ul>
                  </div>
              </div>
          </div>
      );
  }

  return (
    // MODIFICA LAYOUT: Su mobile (default) usa min-h-screen per permettere lo scroll della pagina intera.
    // Su Desktop (lg:) blocca l'altezza (h-screen) e usa lo scroll interno.
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans lg:h-screen lg:overflow-hidden print:h-auto print:overflow-visible">
      
      {/* HEADER SECTION */}
      {/* Su mobile scorre via con la pagina */}
      <div className="flex-none bg-gray-50 z-10 w-full print:hidden shadow-sm relative">
          <div className="container mx-auto p-1 sm:p-4 pb-1 sm:pb-2 max-w-7xl">
            <Header 
                onAddTruck={() => setIsAddModalOpen(true)} 
                onPrint={handlePrint}
                year={year}
                setYear={setYear}
                onSave={handleSaveAndClose}
                onUpdate={handleUpdateClick}
                onOpenTools={() => setIsToolsModalOpen(true)}
                companyName={companyName}
                setCompanyName={setCompanyName}
                activeCount={counts.active}
                soldCount={counts.sold}
                notesCount={counts.withNotes}
                showInstallButton={!!deferredPrompt}
                onInstallApp={handleInstallApp}
            />
          </div>
      </div>

      {/* HIDDEN FILE INPUT */}
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept=".json"
        onChange={handleFileChange}
      />
      
      {/* HEADER DI STAMPA (Visibile solo in stampa) */}
      <div className="hidden print:flex flex-row justify-between items-end mb-8 border-b-2 border-gray-800 pb-4 container mx-auto px-6">
          <div className="flex items-center gap-4">
             <div className="text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v9H1l3 4 3-4H5V9h6v7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 17l-2-6a2 2 0 00-2-2H9.172a2 2 0 00-1.414.586l-3.293 3.293" />
                </svg>
             </div>
             <div>
                 <h1 className="text-3xl font-bold text-gray-900 leading-none">Resoconto Chilometri</h1>
                 <p className="text-sm text-gray-600 font-semibold uppercase mt-1">Gestione Accise - Anno {year}</p>
             </div>
          </div>
          <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900">{companyName}</h2>
          </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {/* Su Mobile: Si espande (flex-grow) ma non ha overflow hidden, così scrolla il body */}
      {/* Su Desktop: flex-1 e overflow-hidden per contenere lo scroll nella tabella */}
      <div className="flex-1 flex flex-col min-h-0 lg:overflow-hidden">
         <div className="container mx-auto p-1 sm:p-4 pt-1 sm:pt-2 max-w-7xl h-full flex flex-col">
            
            {/* Table Container */}
            {/* Su Mobile: Rimuoviamo overflow-y-auto dal container, così usa lo scroll della pagina. */}
            {/* Su Desktop: Manteniamo overflow-auto */}
            <div className="flex-1 bg-white shadow-lg rounded-lg border border-gray-200 relative print:shadow-none print:overflow-visible print:h-auto lg:overflow-auto">
                <table className="w-full text-sm text-left text-gray-700 border-collapse">
                {/* Header Tabella Sticky: Su mobile sticka al body (top-0), su desktop sticka al container */}
                <thead className="text-[10px] sm:text-sm font-bold text-gray-800 uppercase bg-gray-50 sticky top-0 z-20 shadow-sm">
                    <tr>
                    <th scope="col" className="px-0.5 py-2 sm:px-2 sm:py-3 border-b border-gray-200 w-8 sm:w-16 text-center bg-gray-50">
                        <button onClick={() => requestSort('internalCode')} className="flex items-center justify-center w-full">
                        <span className="hidden sm:inline">Cod.</span>
                        <span className="sm:hidden">Id</span>
                        {sortConfig.key === 'internalCode' && (
                            <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? <SortAscendingIcon /> : <SortDescendingIcon />}
                            </span>
                        )}
                        </button>
                    </th>
                    <th scope="col" className="px-1 py-2 sm:px-3 sm:py-3 border-b border-gray-200 w-20 sm:w-40 bg-gray-50">
                        <button onClick={() => requestSort('plate')} className="flex items-center w-full">
                        <span>Veicolo</span>
                        {sortConfig.key === 'plate' && (
                            <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? <SortAscendingIcon /> : <SortDescendingIcon />}
                            </span>
                        )}
                        </button>
                    </th>
                    <th scope="col" className="px-0.5 py-2 sm:px-3 sm:py-3 border-b border-gray-200 text-center w-16 sm:w-36 bg-gray-50">
                        <span className="sm:hidden">Iniz.</span>
                        <span className="hidden sm:inline">KM Iniziali</span>
                    </th>
                    {quarterHeaders.map((header, i) => (
                        <th key={i} scope="col" className="px-0.5 py-2 sm:px-3 sm:py-3 border-b border-gray-200 text-center w-16 sm:w-36 bg-gray-50">
                           <span className="sm:hidden">{header.split('/')[0]}/{header.split('/')[1]}</span>
                           <span className="hidden sm:inline">KM al {header}</span>
                        </th>
                    ))}
                    <th scope="col" className="px-0.5 py-2 sm:px-3 sm:py-3 border-b border-gray-200 text-center w-16 sm:w-36 bg-gray-50">Tot.</th>
                    <th scope="col" className="px-0.5 py-2 sm:px-2 sm:py-3 border-b border-gray-200 print:hidden w-8 sm:w-20 text-center bg-gray-50"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {sortedTrucks.map(truck => (
                    <TruckRow 
                        key={truck.id} 
                        truck={truck} 
                        onUpdate={handleUpdateTruck} 
                        onRemove={handleRequestDelete}
                        onEdit={handleRequestEdit}
                        setInputRef={setInputRef}
                        onEnterPress={handleEnterNavigation}
                    />
                    ))}
                </tbody>
                <tfoot className="bg-gray-50 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 print:static print:shadow-none">
                    <TotalsRow trucks={trucks} />
                </tfoot>
                </table>
            </div>
         </div>
      </div>
      
      {isAddModalOpen && (
        <AddTruckModal 
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddTruck}
          trucks={trucks}
        />
      )}

      {isStartupModalOpen && (
          <StartupModal 
            onUpdate={handleUpdateClick}
            onClose={() => setIsStartupModalOpen(false)}
            lastUpdated={lastUpdated}
          />
      )}

      {isToolsModalOpen && (
          <ToolsModal 
            onClose={() => setIsToolsModalOpen(false)}
            onImportPreviousYear={handleImportPreviousYear}
            onResetMileages={handleResetMileages}
            onClearAll={handleClearAll}
            year={year}
          />
      )}

      {truckToEdit && (
        <EditTruckModal 
          truck={truckToEdit}
          onClose={handleCancelEdit}
          onSave={handleSaveTruck}
          onSwapCodes={handleSwapCodes}
          trucks={trucks}
        />
      )}

      {truckToDeleteId !== null && (
        <ConfirmDeleteModal 
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            truckPlate={trucks.find(t => t.id === truckToDeleteId)?.plate}
        />
      )}
    </div>
  );
};

export default App;