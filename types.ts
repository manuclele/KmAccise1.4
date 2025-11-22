
export interface Truck {
  id: number;
  internalCode: string;
  plate: string;
  notes?: string;
  initialMileage: number | null;
  quarterEndMileage: (number | null)[]; // Array of 4 numbers for end-of-quarter mileage
}
