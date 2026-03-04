// ===== Auth & User =====
export type Role = 'admin' | 'promoteur' | 'manager' | 'user' | 'guest' | 'auditor' | 'support';

export interface User {
  _id: string;
  id: string;
  email: string;
  roles: Role[];
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  roles: Role[];
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  clientProfile?: {
    objectif?: string[];
    modePaiement?: string;
    dejaInvesti?: boolean;
    aversionRisque?: string;
    accompagnements?: string[];
    address?: string;
    residence?: string;
  };
}

// ===== Client Profile =====
export interface ClientProfile {
  _id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  residence?: string;
  objectif?: string[];
  modePaiement?: string;
  dejaInvesti?: boolean;
  aversionRisque?: string;
  accompagnements?: string[];
  preferences?: {
    language?: 'fr' | 'en';
    currency?: string;
    notifications?: {
      email?: boolean;
      whatsapp?: boolean;
      projectUpdates?: boolean;
      newLeads?: boolean;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// ===== Projects =====
export interface Project {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string;
  location?: {
    city?: string;
    country?: string;
    address?: string;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  priceFrom?: number;
  currency?: string;
  projectType?: 'villa' | 'immeuble';
  area?: string;
  city?: string;
  country?: string;
  media?: {
    coverImage?: string;
    renderings?: Array<string | { url: string; mimeType?: string; sizeBytes?: number; uploadedAt?: string }>;
    photos?: Array<string | { url: string; mimeType?: string; sizeBytes?: number; uploadedAt?: string }>;
    videos?: Array<string | { url: string; mimeType?: string; sizeBytes?: number; uploadedAt?: string }>;
    floorPlans?: Array<string | { url: string; mimeType?: string; sizeBytes?: number; uploadedAt?: string }>;
  };
  images?: string[];
  price?: number;
  status?: string;
  trustScore?: number;
  promoteurId?: string;
  promoteurName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== Comparison =====
export interface ComparisonProject {
  _id: string;
  title: string;
  priceFrom?: number;
  currency?: string;
  trustScore?: number;
  media?: { coverImage?: string };
  timeline?: { deliveryDate?: string };
}
export interface Comparison {
  _id: string;
  user: string;
  projects: string[] | ComparisonProject[];
  metrics?: {
    trustScores: number[];
    prices: number[];
    deliveryDates: string[];
    updateFrequencies: number[];
    documentCounts: number[];
    leadResponseTimes: number[];
  };
  notes?: string;
  insights?: {
    bestTrustScore: { index: number; value: number };
    lowestPrice: { index: number; value: number };
    earliestDelivery: { index: number; value: Date };
    mostFrequentUpdates: { index: number; value: number };
    mostDocuments: { index: number; value: number };
    fastestResponse: { index: number; value: number };
  };
  winner?: { winnerIndex: number; winsCount: number; projectId: string };
  createdAt?: string;
}

// ===== Favorites =====
export interface Favorite {
  _id: string;
  projectId: string;
  project?: Project;
  visitDate?: string;
  notes?: string;
  createdAt?: string;
}

// ===== Documents =====
export interface ClientDocument {
  _id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  category?: string;
  tags?: string[];
  url?: string;
  projectId?: string;
  projectName?: string;
  promoteurName?: string;
  promoteurAvatar?: string;
  date?: string;
  value?: string;
  createdAt?: string;
}

// ===== Alerts =====
export interface Alert {
  _id: string;
  user: string;
  type: 'new-project' | 'update-published' | 'status-change' | 'price-change' | 'similar-project' | 'deadline-approaching' | 'favorite-update' | 'promoteur-verified';
  project?: string;
  promoteur?: string;
  criteria: {
    countries?: string[];
    cities?: string[];
    projectTypes?: ('villa' | 'immeuble')[];
    budgetMin?: number;
    budgetMax?: number;
    minTrustScore?: number;
    verifiedOnly?: boolean;
  };
  isActive: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  channels: ('email' | 'whatsapp' | 'sms' | 'push')[];
  title: string;
  message: string;
  link?: string;
  sentAt?: string;
  readAt?: string;
  isRead: boolean;
  triggerCount: number;
  lastTriggeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== Notifications =====
export interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt?: string;
  data?: Record<string, unknown>;
}

// ===== Partners =====
export interface Partner {
  _id: string;
  name: string;
  role: string;
  avatar?: string;
  description?: string;
  specialty?: string;
  location?: string;
  phone?: string;
  email?: string;
  type?: string;
  website?: string;
  address?: string;
  cities?: string[];
  countries?: string[];
  status?: 'pending' | 'active' | 'suspended';
}
