import React, { useMemo } from 'react';
import { Truck } from '../types';
import { TrashIcon, EditIcon } from './Icons';

interface TruckRowProps {
  truck: Truck;
  onUpdate: (truck: Truck) => void;
  onRemove: (id: number) => void;
  onEdit: (truck: Truck) => void;
  onEnterPress: (key: string) => void;
  setInputRef: (element: HTMLInputElement | null, key: string) => void;
}

// Helper to format numbers with dot separators for thousands
const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('it-IT');
};

interface NumberInputProps {
  value: number | null; 
  onChange: (value: number | null) => void;
  isInvalid?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, isInvalid, onKeyDown }, ref) => {
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
      ? 'ring-1 ring-red-500 text-red-600 focus:ring-red-500 border-red-500' 
      : 'focus:border-blue-500 border-transparent sm:border-gray-300';

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric" 
        pattern="[0-9]*"
        value={value === null ? '' : value.toLocaleString('it-IT')}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        // MODIFICA MOBILE: text-[10px] (più piccolo per 6 cifre), padding azzerato, sfondo trasparente su mobile per pulizia
        className={`w-full bg-transparent sm:bg-sky-50/50 text-right px-0 py-0 sm:p-1 text-[10px] sm:text-sm rounded-sm sm:rounded-md border-b-0 sm:border-b-2 focus:outline-none focus:ring-0 ${invalidClasses} font-medium`}
        aria-invalid={isInvalid ? "true" : "false"}
      />
    );
  }
);


const TruckRow: React.FC<TruckRowProps> = ({ truck, onUpdate, onRemove, onEdit, setInputRef, onEnterPress }) => {

  const handleMileageChange = (value: number | null, quarterIndex: number) => {
    const newQuarterEndMileage = [...truck.quarterEndMileage];
    newQuarterEndMileage[quarterIndex] = value;
    onUpdate({ ...truck, quarterEndMileage: newQuarterEndMileage });
  };
  
  const handleInitialMileageChange = (value: number | null) => {
    onUpdate({ ...truck, initialMileage: value });
  };

  // Validation Logic
  const validationStatus = useMemo(() => {
    const { initialMileage, quarterEndMileage } = truck;
    const status = [false, false, false, false, false]; // [initial, q1, q2, q3, q4]

    let lastValidValue = initialMileage;
    
    if (quarterEndMileage[0] !== null) {
        if (lastValidValue !== null && quarterEndMileage[0] < lastValidValue) status[1] = true;
        else lastValidValue = quarterEndMileage[0];
    }

    if (quarterEndMileage[1] !== null) {
        let prev = initialMileage;
        if (quarterEndMileage[0] !== null) prev = quarterEndMileage[0];
        if (prev !== null && quarterEndMileage[1] < prev) status[2] = true;
    }

    if (quarterEndMileage[2] !== null) {
         let prev = initialMileage;
         if (quarterEndMileage[1] !== null) prev = quarterEndMileage[1];
         else if (quarterEndMileage[0] !== null) prev = quarterEndMileage[0];
         if (prev !== null && quarterEndMileage[2] < prev) status[3] = true;
    }

    if (quarterEndMileage[3] !== null) {
         let prev = initialMileage;
         if (quarterEndMileage[2] !== null) prev = quarterEndMileage[2];
         else if (quarterEndMileage[1] !== null) prev = quarterEndMileage[1];
         else if (quarterEndMileage[0] !== null) prev = quarterEndMileage[0];
         if (prev !== null && quarterEndMileage[3] < prev) status[4] = true;
    }

    return status;
  }, [truck]);

  const quarterlyMileages = useMemo(() => {
    const { initialMileage, quarterEndMileage } = truck;
    return quarterEndMileage.map((currentReading, index) => {
        if (currentReading === null || currentReading === undefined) return null;
        let prevReading = initialMileage;
        for (let i = index - 1; i >= 0; i--) {
            if (quarterEndMileage[i] !== null && quarterEndMileage[i] !== undefined) {
                prevReading = quarterEndMileage[i];
                break; 
            }
        }
        if (prevReading !== null && currentReading >= prevReading) {
            return currentReading - prevReading;
        }
        return 0; 
    });
  }, [truck]);

  const yearlyTotal: number = useMemo(() => {
    return quarterlyMileages.reduce((accumulator: number, current: number | null) => accumulator + (current || 0), 0);
  }, [quarterlyMileages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, key: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnterPress(key);
    }
  };

  return (
    <tr className="bg-white hover:bg-gray-50/70">
        <td className="px-0.5 py-1 sm:px-2 sm:py-3 text-center">
            <span className="bg-gray-100 text-gray-700 rounded px-1 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-sm font-mono font-bold block sm:inline">{truck.internalCode}</span>
        </td>
        <td className="px-0.5 py-1 sm:px-3 sm:py-3">
            {/* FONT PIÙ PICCOLO SU MOBILE (text-[10px] per la targa) */}
            <div className="text-[10px] sm:text-lg font-bold text-gray-800 leading-tight truncate">{truck.plate}</div>
            {truck.isSold ? (
               <div className="text-[9px] sm:text-xs text-red-600 font-bold uppercase leading-none">(VENDUTO)</div>
            ) : (
               truck.notes && <div className="text-[9px] sm:text-xs text-gray-500 font-semibold truncate max-w-[50px] sm:max-w-none leading-none">{truck.notes}</div>
            )}
        </td>
        <td className="px-0.5 py-1 sm:px-2 sm:py-3 align-top">
           <NumberInput 
            ref={(el) => setInputRef(el, `${truck.id}-initial`)}
            value={truck.initialMileage} 
            onChange={handleInitialMileageChange} 
            isInvalid={validationStatus[0]}
            onKeyDown={(e) => handleKeyDown(e, `${truck.id}-initial`)}
            />
        </td>
        {truck.quarterEndMileage.map((mileage, index) => (
          <td key={index} className="px-0.5 py-1 sm:px-2 sm:py-3 align-top">
             <NumberInput
                ref={(el) => setInputRef(el, `${truck.id}-q${index}`)}
                value={mileage} 
                onChange={(val) => handleMileageChange(val, index)} 
                isInvalid={validationStatus[index + 1]}
                onKeyDown={(e) => handleKeyDown(e, `${truck.id}-q${index}`)}
              />
             {/* FONT DEL PARZIALE RIDOTTO SU MOBILE */}
             <div className="text-[9px] sm:text-base text-right text-blue-800 mt-0 sm:mt-2 pr-0 sm:pr-1 font-bold leading-none">{formatNumber(quarterlyMileages[index])}</div>
          </td>
        ))}
        <td className="px-0.5 py-1 sm:px-3 sm:py-3 text-right font-bold text-[10px] sm:text-lg text-gray-800 align-top sm:align-middle">
            {yearlyTotal > 0 ? formatNumber(yearlyTotal) : '-'}
        </td>
        <td className="px-0.5 py-1 sm:px-2 sm:py-3 text-center align-middle print:hidden">
          <div className="flex items-center justify-center space-x-0 sm:space-x-1 flex-col sm:flex-row gap-1 sm:gap-0">
            <button
                onClick={() => onEdit(truck)}
                className="text-gray-400 hover:text-blue-600 p-0.5 sm:p-2 rounded-full transition-colors duration-150 focus:outline-none"
                aria-label={`Modifica veicolo ${truck.plate}`}
            >
                <EditIcon className="h-3 w-3 sm:h-5 sm:w-5"/>
            </button>
            <button
                onClick={() => onRemove(truck.id)}
                className="text-gray-400 hover:text-red-600 p-0.5 sm:p-2 rounded-full transition-colors duration-150 focus:outline-none"
                aria-label={`Elimina veicolo ${truck.plate}`}
            >
                <TrashIcon className="h-3 w-3 sm:h-5 sm:w-5" />
            </button>
          </div>
        </td>
    </tr>
  );
};

export default TruckRow;