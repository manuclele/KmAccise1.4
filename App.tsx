import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Truck } from './types';
import Header from './components/Header';
import TotalsRow from './components/TotalsRow';
import TruckRow from './components/TruckRow';
import AddTruckModal from './components/AddTruckModal';
import EditTruckModal from './components/EditTruckModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import { SortAscendingIcon, SortDescendingIcon } from './components/Icons';

// This data is used as a one-time seed if no saved data is found for the initial year.
const initialSeedData: Truck[] = [
  { id: 1, internalCode: '855', plate: 'GG 949 BC', initialMileage: 227499, quarterEndMileage: [250363, 280752, 314144, null] },
  { id: 2, internalCode: '655', plate: 'GB 916 JS', initialMileage: 466599, quarterEndMileage: [491723, 522254, 553898, null] },
  { id: 3, internalCode: '866', plate: 'GK 808 JA', initialMileage: 172375, quarterEndMileage: [199985, 224562, 248364, null] },
  { id: 4, internalCode: '755', plate: 'GB 941 JS', initialMileage: 410398, quarterEndMileage: [435176, 468358, 502693, null] },
  { id: 5, internalCode: '155', plate: 'FC 349 YW', initialMileage: 810871, quarterEndMileage: [828211, 851711, 873551, null] },
  { id: 6, internalCode: '856', plate: 'FB 841 FP', initialMileage: 997918, quarterEndMileage: [1007587, 1027385, 1044400, null] },
  { id: 7, internalCode: '455', plate: 'EV 134 PN', notes: '(VENDUTO)', initialMileage: 912084, quarterEndMileage: [924371, null, null, null] },
];
const SEED_YEAR = new Date().getFullYear();

type SortKey = 'internalCode' | 'plate';
type SortDirection = 'ascending' | 'descending';

const App: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [trucks, setTrucks] = useState<Truck[]>([]); // Start empty, load from localStorage in effect
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [truckToDeleteId, setTruckToDeleteId] = useState<number | null>(null);
  const [truckToEdit, setTruckToEdit] = useState<Truck | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: SortDirection }>({ key: null, direction: 'ascending' });
  
  const isInitialMount = useRef(true);

  // Load trucks from localStorage when the component mounts or the year changes
  useEffect(() => {
    const savedData = localStorage.getItem(`trucks_${year}`);
    if (savedData) {
      try {
        setTrucks(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse trucks data from localStorage", e);
        setTrucks(year === SEED_YEAR ? initialSeedData : []);
      }
    } else {
      // If no data for the current year, use seed data or an empty array
      setTrucks(year === SEED_YEAR ? initialSeedData : []);
    }
  }, [year]);

  // Save trucks to localStorage whenever the trucks data changes
  useEffect(() => {
    // Prevent saving the initial empty state on the very first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(`trucks_${year}`, JSON.stringify(trucks));
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

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleAddTruck = (newTruckData: Omit<Truck, 'id' | 'quarterEndMileage'>) => {
    const newTruck: Truck = {
      ...newTruckData,
      id: Date.now(),
      quarterEndMileage: [null, null, null, null],
    };
    setTrucks(currentTrucks => [...currentTrucks, newTruck]);
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

  const handlePrint = () => {
    window.print();
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


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans print:p-0 max-w-7xl">
      <Header 
        onAddTruck={() => setIsAddModalOpen(true)} 
        onPrint={handlePrint}
        year={year}
        setYear={setYear}
      />

      <div className="bg-white shadow-lg rounded-lg overflow-x-auto print:shadow-none">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-sm font-bold text-gray-800 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-2 py-3 border-b border-gray-200 w-16 text-center">
                <button onClick={() => requestSort('internalCode')} className="flex items-center justify-center w-full">
                  <span>Cod.</span>
                  {sortConfig.key === 'internalCode' && (
                      <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? <SortAscendingIcon /> : <SortDescendingIcon />}
                      </span>
                  )}
                </button>
              </th>
              <th scope="col" className="px-3 py-3 border-b border-gray-200 w-40">
                <button onClick={() => requestSort('plate')} className="flex items-center w-full">
                  <span>Veicolo</span>
                  {sortConfig.key === 'plate' && (
                      <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? <SortAscendingIcon /> : <SortDescendingIcon />}
                      </span>
                  )}
                </button>
              </th>
              <th scope="col" className="px-3 py-3 border-b border-gray-200 text-center w-36">
                KM Iniziali
              </th>
              {quarterHeaders.map((header, i) => (
                <th key={i} scope="col" className="px-3 py-3 border-b border-gray-200 text-center w-36">
                  KM al {header}
                </th>
              ))}
              <th scope="col" className="px-3 py-3 border-b border-gray-200 text-center w-36">Totale Anno</th>
              <th scope="col" className="px-2 py-3 border-b border-gray-200 print:hidden w-20 text-center">Azioni</th>
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
              />
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <TotalsRow trucks={trucks} />
          </tfoot>
        </table>
      </div>
      
      {isAddModalOpen && (
        <AddTruckModal 
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddTruck}
        />
      )}

      {truckToEdit && (
        <EditTruckModal 
          truck={truckToEdit}
          onClose={handleCancelEdit}
          onSave={handleSaveTruck}
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