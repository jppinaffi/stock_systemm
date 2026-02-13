// Types and interfaces for the supply management system

export type UserRole = 'admin' | 'branch_operator';

export type ItemStatus = 'cadastrado' | 'em_transito' | 'disponivel' | 'consumido';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  branchId?: string;
  active: boolean;
  createdAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  active: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  description: string;
  category: 'alimento' | 'medicamento' | 'enxoval' | 'outro';
  unit: string;
  requiresBarcode: boolean;
  createdAt: Date;
}

export interface Purchase {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierId: string;
  purchaseDate: Date;
  receivedBy: string;
  createdAt: Date;
}

export interface BranchAuthorization {
  id: string;
  branchId: string;
  productId: string;
  authorized: boolean;
  authorizedBy: string;
  authorizedAt: Date;
}

export interface Inventory {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  status: ItemStatus;
  unitPrice: number;
  lastUpdated: Date;
}

export interface Movement {
  id: string;
  productId: string;
  fromBranchId?: string;
  toBranchId: string;
  quantity: number;
  status: ItemStatus;
  unitPrice: number;
  userId: string;
  movementDate: Date;
  createdAt: Date;
}

export interface Consumption {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  consumedBy: string;
  consumedByCPF: string;
  consumedAt: Date;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  branchId: string;
  productId: string;
  quantity: number;
  requestedBy: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'enviado' | 'recebido';
  justification?: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  branchId: string;
  odometer: number;
  active: boolean;
}

export interface Refueling {
  id: string;
  vehicleId: string;
  branchId: string;
  liters: number;
  pricePerLiter: number;
  totalPrice: number;
  odometer: number;
  fueledBy: string;
  fueledAt: Date;
}

export interface Boat {
  id: string;
  name: string;
  registration: string;
  model: string;
  branchId: string;
  engineHours: number;
  active: boolean;
}

export interface BoatRefueling {
  id: string;
  boatId: string;
  branchId: string;
  liters: number;
  pricePerLiter: number;
  totalPrice: number;
  engineHours: number;
  fueledBy: string;
  fueledAt: Date;
  notes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  userCPF: string;
  branchId?: string;
  details: Record<string, any>;
  timestamp: Date;
}