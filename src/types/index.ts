export interface EstimateItem {
  id: string;
  particular: string;
  length: number;
  width: number;
  qty: number;
  sqft: number;
  rate: number;
  costPrice: number; // Added for profit calculation
  amount: number;
}

export interface Estimate {
  id: string;
  estNo: string;
  date: string;
  customerName: string;
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
  totalOrders: number;
  totalSpent: number;
}
