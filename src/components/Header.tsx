
import React from 'react';
import { PlusIcon, PrintIcon, ChevronLeftIcon, ChevronRightIcon, SaveIcon, UpdateIcon, CogIcon, DownloadIcon } from './Icons';

interface HeaderProps {
  onAddTruck: () => void;
  onPrint: () => void;
  year: number;
  setYear: (year: number) => void;
  onSave: () => void;
  onUpdate: () => void;
  onOpenTools: () => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  activeCount: number;
  soldCount: number;
  notesCount: number;
  showInstallButton?: boolean;
  onInstallApp?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onAddTruck, 
    onPrint, 
    year, 
    setYear, 
    onSave, 
    onUpdate, 
    onOpenTools,
    companyName,
    setCompanyName,
    activeCount,
    soldCount,
    notesCount,
    showInstallButton,
    onInstallApp
}) => {

  return (
    <header className="mb-0 print:hidden">
      <style>{`
        .no-spinner::-webkit-inner-spin-button, 
        .no-spinner::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Container Card: Padding ridottissimo su mobile (p-2), normale su PC (sm:p-4) */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-2 sm:p-4">
        
        {/* RIGA SUPERIORE: Info App, Anno e Nome Azienda */}
        {/* Su mobile usa flex-row per affiancare titolo e azienda se c'è spazio, o wrap */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 sm:gap-4 mb-2 sm:mb-4 border-b border-gray-100 pb-1 sm:pb-4">
            
            {/* Logo, Titolo e Anno */}
            <div className="flex items-center gap-2 min-w-fit w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white p-1 sm:p-2.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-200 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v9H1l3 4 3-4H5V9h6v7" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 17l-2-6a2 2 0 00-2-2H9.172a2 2 0 00-1.414.586l-3.293 3.293" />
                        </svg>
                    </div>
                    
                    <div className="flex flex-col justify-center">
                        <span className="hidden sm:block text-xs font-bold text-gray-400 uppercase tracking-wider">Gestione Accise</span>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <h1 className="text-base sm:text-xl font-black text-gray-800 leading-none">Resoconto Km</h1>
                            {/* Selettore Anno Compatto */}
                            <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200 h-6 sm:h-7 ml-1 sm:ml-2">
                                <button onClick={() => setYear(year - 1)} className="px-1 text-gray-500 hover:text-blue-700 hover:bg-gray-200 rounded-l-lg transition-colors"><ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" /></button>
                                <span className="font-bold text-xs sm:text-base text-blue-900 px-1 sm:px-2">{year}</span>
                                <button onClick={() => setYear(year + 1)} className="px-1 text-gray-500 hover:text-blue-700 hover:bg-gray-200 rounded-r-lg transition-colors"><ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* NOME AZIENDA */}
            <div className="w-full lg:mx-8 mt-1 lg:mt-0">
                 <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="NOME AZIENDA..."
                    className="w-full text-lg sm:text-3xl lg:text-4xl font-bold text-gray-800 placeholder-gray-300 border-b border-dashed border-gray-300 focus:border-blue-500 bg-transparent focus:outline-none transition-all text-left lg:text-left py-0 sm:py-1 tracking-tight h-auto leading-tight"
                 />
            </div>

            {/* CONTATORI (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                 <div className="flex flex-col items-end">
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Stato Flotta</div>
                    <div className="flex gap-2">
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold border border-emerald-200" title="Veicoli Attivi">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Attivi: {activeCount}
                        </div>
                        {notesCount > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-bold border border-amber-200" title="Veicoli con Note">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Note: {notesCount}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-bold border border-red-100" title="Veicoli Venduti">
                             Venduti: {soldCount}
                        </div>
                    </div>
                 </div>
            </div>
        </div>

        {/* RIGA INFERIORE: Pulsanti Azione e Contatori Mobile */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
            
            {/* Contatori (Mobile Only) - Molto compatti */}
            <div className="lg:hidden flex items-center gap-1.5 w-full justify-start mb-1 flex-wrap">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] sm:text-xs font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Att: {activeCount}
                </div>
                {notesCount > 0 && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] sm:text-xs font-bold border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Note: {notesCount}
                    </div>
                )}
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[10px] sm:text-xs font-bold border border-red-100">
                     Vend: {soldCount}
                </div>
            </div>

            <div className="flex w-full justify-between items-center sm:w-auto gap-1.5 sm:gap-2">
                {/* GRUPPO 1: Strumenti Secondari (Icone piccole su mobile) */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={onAddTruck}
                        className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-bold p-1.5 sm:py-2 sm:px-4 rounded-lg flex items-center gap-2 shadow-sm hover:shadow transition-all text-sm"
                        title="Nuovo Veicolo"
                    >
                        <PlusIcon className="h-5 w-5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Nuovo Veicolo</span>
                    </button>
                    
                    <div className="h-6 sm:h-8 w-px bg-gray-200 mx-0.5 sm:mx-1"></div>

                    <button
                        onClick={onPrint}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all shadow-sm"
                        title="Stampa Resoconto"
                    >
                        <PrintIcon className="h-5 w-5" />
                    </button>
                    
                    <button
                        onClick={onOpenTools}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-700 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-all shadow-sm"
                        title="Strumenti Avanzati"
                    >
                        <CogIcon className="h-5 w-5" />
                    </button>

                    {/* Pulsante INSTALLA APP */}
                    {showInstallButton && onInstallApp && (
                        <button
                            onClick={onInstallApp}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-1.5 sm:py-2 sm:px-4 rounded-lg flex items-center gap-2 shadow-sm hover:shadow transition-all text-sm ml-1 sm:ml-2 animate-pulse"
                            title="Installa App"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Installa App</span>
                        </button>
                    )}
                </div>

                {/* GRUPPO 2: Pulsanti FONDAMENTALI (Update/Save) - Compatti su mobile */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={onUpdate}
                        className="flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2.5 text-[10px] sm:text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all transform active:scale-95 border-b-2 sm:border-b-4 border-amber-600 active:border-b-0 active:translate-y-1"
                        title="Carica dati"
                    >
                        <UpdateIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">AGGIORNA</span>
                        <span className="sm:hidden">LOAD</span>
                    </button>
                    
                    <button
                        onClick={onSave}
                        className="flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-6 py-1.5 sm:py-2.5 text-[10px] sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all transform active:scale-95 border-b-2 sm:border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 ring-1 sm:ring-2 ring-emerald-100"
                        title="Salva e chiudi"
                    >
                        <SaveIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">SALVA E CHIUDI</span>
                        <span className="sm:hidden">SALVA</span>
                    </button>
                </div>
            </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
