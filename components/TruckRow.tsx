import React, { useMemo } from 'react';
import { Truck } from '../types';
import { TrashIcon, EditIcon } from './Icons';

interface TruckRowProps {
  truck: Truck;
  onUpdate: (truck: Truck) => void;
  onRemove: (id: number) => void;
  onEdit: (truck: Truck) => void;
}

// Helper to format numbers with dot separators for thousands
const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('it-IT');
};

const calculateQuarterlyMileage = (end: number | null, start: number | null): number | null => {
    if (typeof end === 'number' && typeof start === 'number' && end >= start) {
      return end - start;
    }
    return null;
};

const NumberInput: React.FC<{ 
  value: number | null; 
  onChange: (value: number | null) => void;
  isInvalid?: boolean;
}> = ({ value, onChange, isInvalid }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(null);
    } else {
      const num = parseInt(val.replace(/\./g, ''), 10);
      if (!isNaN(num) && num >= 0) {
        onChange(num);
      }
    }
  };

  const invalidClasses = isInvalid 
    ? 'ring-2 ring-red-500 text-red-600 focus:ring-red-500 border-red-500' 
    : 'focus:border-blue-500 border-gray-300';

  return (
    <input
      type="text"
      value={value === null ? '' : value.toLocaleString('it-IT')}
      onChange={handleChange}
      className={`w-full bg-sky-50/50 text-right p-1 rounded-md border-b-2 focus:outline-none focus:ring-0 ${invalidClasses}`}
      aria-invalid={isInvalid ? "true" : "false"}
    />
  );
};


const TruckRow: React.FC<TruckRowProps> = ({ truck, onUpdate, onRemove, onEdit }) => {

  const handleMileageChange = (value: number | null, quarterIndex: number) => {
    const newQuarterEndMileage = [...truck.quarterEndMileage];
    newQuarterEndMileage[quarterIndex] = value;
    onUpdate({ ...truck, quarterEndMileage: newQuarterEndMileage });
  };
  
  const handleInitialMileageChange = (value: number | null) => {
    onUpdate({ ...truck, initialMileage: value });
  };

  const validationStatus = useMemo(() => {
    const { initialMileage, quarterEndMileage } = truck;
    const status = [false, false, false, false, false]; // [initial, q1, q2, q3, q4]

    const allMileages = [initialMileage, ...quarterEndMileage];
    for (let i = 0; i < allMileages.length - 1; i++) {
      const current = allMileages[i];
      const next = allMileages[i+1];
      if (current !== null && next !== null && current > next) {
        status[i] = true;
        status[i+1] = true;
      }
    }
    return status;
  }, [truck]);

  const quarterlyMileages = useMemo(() => {
    return [
        calculateQuarterlyMileage(truck.quarterEndMileage[0], truck.initialMileage),
        calculateQuarterlyMileage(truck.quarterEndMileage[1], truck.quarterEndMileage[0]),
        calculateQuarterlyMileage(truck.quarterEndMileage[2], truck.quarterEndMileage[1]),
        calculateQuarterlyMileage(truck.quarterEndMileage[3], truck.quarterEndMileage[2])
    ];
  }, [truck]);

  const totalYearlyMileage = useMemo(() => {
    return quarterlyMileages.reduce((sum, current) => sum + (current || 0), 0);
  }, [quarterlyMileages]);

  return (
    <tr className="bg-white hover:bg-gray-50/70">
        <td className="px-2 py-3 text-center">
            <span className="bg-gray-200 text-gray-700 rounded-md px-2 py-1 text-sm font-mono font-bold">{truck.internalCode}</span>
        </td>
        <td className="px-3 py-3">
            <div className="text-lg font-bold text-gray-800">{truck.plate}</div>
            {truck.notes && <div className="text-xs text-red-600 font-semibold">{truck.notes}</div>}
        </td>
        <td className="px-2 py-3">
           <NumberInput value={truck.initialMileage} onChange={handleInitialMileageChange} isInvalid={validationStatus[0]} />
        </td>
        {truck.quarterEndMileage.map((mileage, index) => (
          <td key={index} className="px-2 py-3 align-top">
             <NumberInput value={mileage} onChange={(val) => handleMileageChange(val, index)} isInvalid={validationStatus[index + 1]} />
             <div className="text-base text-right text-blue-800 mt-2 pr-1 font-bold">{formatNumber(quarterlyMileages[index])}</div>
          </td>
        ))}
        <td className="px-3 py-3 text-right font-bold text-lg text-gray-800 align-middle">
            {totalYearlyMileage > 0 ? formatNumber(totalYearlyMileage) : '-'}
        </td>
        <td className="px-2 py-3 text-center align-middle print:hidden">
          <div className="flex items-center justify-center space-x-1">
            <button
                onClick={() => onEdit(truck)}
                className="text-gray-400 hover:text-blue-600 p-2 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label={`Modifica veicolo ${truck.plate}`}
            >
                <EditIcon />
            </button>
            <button
                onClick={() => onRemove(truck.id)}
                className="text-gray-400 hover:text-red-600 p-2 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                aria-label={`Elimina veicolo ${truck.plate}`}
            >
                <TrashIcon />
            </button>
          </div>
        </td>
    </tr>
  );
};

export default TruckRow;