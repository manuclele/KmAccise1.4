
export interface Truck {
  id: number;
  internalCode: string;
  plate: string;
  notes?: string;
  isSold?: boolean; // Flag per indicare se il veicolo è venduto
  initialMileage: number | null;
  quarterEndMileage: (number | null)[]; // Array of 4 numbers for end-of-quarter mileage
}
