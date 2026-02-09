import api from './api';
import type {
  ClientProfile,
  Project,
  Favorite,
  ClientDocument,
  Notification,
  Partner,
} from './types';

// ===== Client Profile =====
export const clientProfileService = {
  getProfile: async (): Promise<ClientProfile> => {
    const response = await api.get('/api/client/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<ClientProfile>): Promise<ClientProfile> => {
    const response = await api.put('/api/client/profile', data);
    return response.data;
  },
};

// ===== Projects =====
export const projectService = {
  searchProjects: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ projects: Project[]; total: number }> => {
    const response = await api.get('/api/client/projects/search', { params });
    if (Array.isArray(response.data)) {
      return { projects: response.data, total: response.data.length };
    }
    return response.data;
  },

  getPublicProjects: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<Project[]> => {
    const response = await api.get('/api/projects', { params });
    return Array.isArray(response.data) ? response.data : response.data.projects || [];
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },
};

// ===== Favorites =====
export const favoriteService = {
  getFavorites: async (): Promise<Favorite[]> => {
    const response = await api.get('/api/client/favorites');
    return Array.isArray(response.data) ? response.data : response.data.favorites || [];
  },

  addFavorite: async (projectId: string): Promise<Favorite> => {
    const response = await api.post(`/api/client/favorites/${projectId}`);
    return response.data;
  },

  removeFavorite: async (projectId: string): Promise<void> => {
    await api.delete(`/api/client/favorites/${projectId}`);
  },

  updateFavorite: async (projectId: string, data: { notes?: string }): Promise<Favorite> => {
    const response = await api.put(`/api/client/favorites/${projectId}`, data);
    return response.data;
  },
};

// ===== Notifications =====
export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/api/client/notifications');
    return Array.isArray(response.data) ? response.data : response.data.notifications || [];
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.put(`/api/client/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/api/client/notifications/read-all');
  },
};

// ===== Partners =====
export const partnerService = {
  getPartners: async (params?: {
    type?: string;
  }): Promise<Partner[]> => {
    const response = await api.get('/api/partners', { params });
    return Array.isArray(response.data) ? response.data : response.data.partners || [];
  },
};

// ===== Documents =====
export const documentService = {
  getDocuments: async (params?: {
    category?: string;
  }): Promise<ClientDocument[]> => {
    try {
      const response = await api.get('/api/documents', { params });
      return Array.isArray(response.data) ? response.data : response.data.documents || [];
    } catch {
      // Route not yet implemented for clients — return empty array
      return [];
    }
  },
};

// ===== Reports =====
export const reportService = {
  reportContent: async (data: {
    targetId: string;
    targetType: string;
    reason: string;
  }): Promise<void> => {
    await api.post('/api/client/report', data);
  },
};

// ===== Become Promoteur =====
export const becomePromoteurService = {
  getStatus: async (): Promise<{
    status: 'none' | 'pending' | 'active';
    isPromoteur: boolean;
    promoteur?: {
      organizationName: string;
      plan: string;
      subscriptionStatus: string;
    };
  }> => {
    const response = await api.get('/api/client/promoteur-status');
    return response.data;
  },

  createSubscription: async (data: {
    organizationName: string;
    organizationType: string;
    plan: string;
    paymentMethodId: string;
  }): Promise<{ subscriptionId: string; clientSecret: string }> => {
    const response = await api.post('/api/client/become-promoteur', data);
    return response.data;
  },

  confirmPayment: async (subscriptionId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/api/client/confirm-become-promoteur', { subscriptionId });
    return response.data;
  },
};
