import React, { useMemo } from 'react';
import { Truck } from '../types';

interface TotalsRowProps {
  trucks: Truck[];
}

// Helper to format numbers with dot separators for thousands
const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '';
  return num.toLocaleString('it-IT');
};

const TotalsRow: React.FC<TotalsRowProps> = ({ trucks }) => {
  const totals = useMemo(() => {
    const quarterlyTotals = [0, 0, 0, 0];
    
    trucks.forEach(truck => {
        truck.quarterEndMileage.forEach((currentReading, index) => {
            if (currentReading !== null && currentReading !== undefined) {
                let prevReading = truck.initialMileage;
                for (let i = index - 1; i >= 0; i--) {
                    if (truck.quarterEndMileage[i] !== null && truck.quarterEndMileage[i] !== undefined) {
                        prevReading = truck.quarterEndMileage[i];
                        break;
                    }
                }
                if (prevReading !== null && currentReading >= prevReading) {
                    quarterlyTotals[index] += (currentReading - prevReading);
                }
            }
        });
    });

    const grandTotal = quarterlyTotals.reduce((accumulator, current) => accumulator + current, 0);
    return { quarterlyTotals, grandTotal };
  }, [trucks]);

  return (
    <tr className="font-bold text-gray-900 bg-gray-200 text-[10px] sm:text-base">
      <td colSpan={2} className="px-1 py-2 sm:px-3 sm:py-4 border-t-2 border-gray-300 text-[10px] sm:text-lg">Totale</td>
      <td className="px-1 py-2 sm:px-3 sm:py-4 border-t-2 border-gray-300"></td>
      {totals.quarterlyTotals.map((total, index) => (
        <td key={index} className="px-0.5 py-2 sm:px-3 sm:py-4 border-t-2 border-gray-300 text-right whitespace-nowrap">
          {formatNumber(total)}
        </td>
      ))}
      <td className="px-0.5 py-2 sm:px-3 sm:py-4 border-t-2 border-gray-300 text-right whitespace-nowrap">
        {formatNumber(totals.grandTotal)}
      </td>
      <td className="px-1 py-2 sm:px-2 sm:py-4 border-t-2 border-gray-300 print:hidden"></td>
    </tr>
  );
};

export default TotalsRow;