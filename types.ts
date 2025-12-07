
export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER'
}

export enum RequestStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  FULFILLED = 'FULFILLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string; // For Seller
  vendorName?: string; // For Seller
}

export interface Bid {
  id: string;
  sellerName: string;
  amount: number;
  deliveryDays: number;
  notes: string;
  timestamp: number;
}

export interface ProductRequirement {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  specs: Record<string, string | number | boolean>; // AI generated specs
  estimatedMarketPrice: { min: number; max: number }; // AI estimated
  bids: Bid[];
  status: RequestStatus;
  createdAt: number;
  location: string;
  winningBidId?: string; // ID of the accepted bid
  paymentMethod?: 'COD' | 'ONLINE'; // Payment method used
}

export interface AIAnalysisResult {
  title: string;
  category: string;
  specs: Record<string, string | number | boolean>;
  estimatedMarketPrice: { min: number; max: number };
  suggestedMaxBudget: number;
}

export interface BidSuggestion {
  suggestedPrice: number;
  reasoning: string;
  winProbability: string;
}
