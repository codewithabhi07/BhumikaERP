export interface EstimateItem {
  id: string;
  particular: string;
  length?: number;
  width?: number;
  qty: number;
  sqft?: number;
  rate: number;
  costPrice: number;
  amount: number;
  isExtra?: boolean; // True for items without measurements
}

export interface Estimate {
  id: string;
  estNo: string;
  date: string;
  customerName: string;
  village?: string; // Added village field
  mobileNumber: string;
  items: EstimateItem[];
  subTotal: number;
  totalCost: number; // Added for profit calculation
  discount: number;
  gstType: 'none' | 'sgst_cgst' | 'igst';
  gstRate: number;
  grandTotal: number;
  paidAmount: number;
  balance: number;
}

export interface Product {
  id: string;
  name: string;
  defaultRate: number;
  costPrice: number; // Added for profit calculation
  stock: number;
  minStock: number; // Added for low stock alerts
}

export interface KhatabookEntry {
  id: string;
  name: string;
  mobile: string;
  amount: number;
  type: 'give' | 'take';
  dueDate: string;
  notes: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  village?: string;
  isThekedar: boolean; // True if this is a registered contractor
  totalOrders: number;
  totalSpent: number;
  balance: number; // Running balance for Khatabook integration
}

export interface AttendanceEntry {
  date: string;
  status: 'present' | 'absent' | 'half-day';
}

export interface AdvanceEntry {
  id: string;
  amount: number;
  date: string;
  notes: string;
}

export interface Employee {
  id: string;
  name: string;
  mobile: string;
  village: string;
  role: string; // manager, worker, labour etc.
  salary: number;
  joinDate: string;
  attendance: AttendanceEntry[];
  advances: AdvanceEntry[];
}
