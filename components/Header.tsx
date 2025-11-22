
import React from 'react';
import { PlusIcon, PrintIcon } from './Icons';

interface HeaderProps {
  onAddTruck: () => void;
  onPrint: () => void;
  year: number;
  setYear: (year: number) => void;
}

const Header: React.FC<HeaderProps> = ({ onAddTruck, onPrint, year, setYear }) => {
  return (
    <header className="mb-6 print:hidden bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Resoconto Chilometri</h1>
            <p className="text-md text-gray-500 mt-1">per conteggio accise</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <label htmlFor="year-select" className="text-sm font-medium text-gray-700">Anno:</label>
            <input
              id="year-select"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-24 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              aria-label="Seleziona l'anno"
            />
          </div>
          <button
            onClick={onAddTruck}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow-sm"
          >
            <PlusIcon />
            <span className="ml-2 hidden sm:inline">Aggiungi Veicolo</span>
          </button>
          <button
            onClick={onPrint}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow-sm"
          >
            <PrintIcon />
            <span className="ml-2 hidden sm:inline">Stampa</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;