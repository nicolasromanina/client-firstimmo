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
  status?: string;
  trustScore?: number;
  promoteurId?: string;
  promoteurName?: string;
  createdAt?: string;
  updatedAt?: string;
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
  url?: string;
  projectId?: string;
  projectName?: string;
  promoteurName?: string;
  promoteurAvatar?: string;
  date?: string;
  value?: string;
  createdAt?: string;
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
}
