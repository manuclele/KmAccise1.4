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

// Helper to calculate mileage for a single truck's quarter
const calculateQuarterlyMileage = (end: number | null, start: number | null): number => {
    if (typeof end === 'number' && typeof start === 'number' && end >= start) {
      return end - start;
    }
    return 0;
};

const TotalsRow: React.FC<TotalsRowProps> = ({ trucks }) => {
  const totals = useMemo(() => {
    const quarterlyTotals = [0, 0, 0, 0];
    trucks.forEach(truck => {
      const q1Mileage = calculateQuarterlyMileage(truck.quarterEndMileage[0], truck.initialMileage);
      const q2Mileage = calculateQuarterlyMileage(truck.quarterEndMileage[1], truck.quarterEndMileage[0]);
      const q3Mileage = calculateQuarterlyMileage(truck.quarterEndMileage[2], truck.quarterEndMileage[1]);
      const q4Mileage = calculateQuarterlyMileage(truck.quarterEndMileage[3], truck.quarterEndMileage[2]);
      
      quarterlyTotals[0] += q1Mileage;
      quarterlyTotals[1] += q2Mileage;
      quarterlyTotals[2] += q3Mileage;
      quarterlyTotals[3] += q4Mileage;
    });
    const grandTotal = quarterlyTotals.reduce((sum, current) => sum + current, 0);
    return { quarterlyTotals, grandTotal };
  }, [trucks]);

  return (
    <tr className="font-bold text-gray-900 bg-gray-200 text-base">
      <td colSpan={2} className="px-3 py-4 border-t-2 border-gray-300 text-lg">Totale Trimestri</td>
      <td className="px-3 py-4 border-t-2 border-gray-300"></td>
      {totals.quarterlyTotals.map((total, index) => (
        <td key={index} className="px-3 py-4 border-t-2 border-gray-300 text-right whitespace-nowrap">
          {formatNumber(total)}
        </td>
      ))}
      <td className="px-3 py-4 border-t-2 border-gray-300 text-right whitespace-nowrap">
        {formatNumber(totals.grandTotal)}
      </td>
      <td className="px-2 py-4 border-t-2 border-gray-300 print:hidden"></td>
    </tr>
  );
};

export default TotalsRow;