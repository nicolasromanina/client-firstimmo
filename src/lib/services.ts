import { request } from './client';
import type {
  ClientProfile,
  Project,
  Favorite,
  ClientDocument,
  Notification,
  Partner,
  Alert,
} from './types';

// ===== Client Profile =====
export const clientProfileService = {
  getProfile: async (): Promise<ClientProfile> => {
    return await request({ url: '/api/client/profile', method: 'get' });
  },

  updateProfile: async (data: Partial<ClientProfile>): Promise<ClientProfile> => {
    return await request({ url: '/api/client/profile', method: 'put', data });
  },
};

// ===== Projects =====
export interface ProjectSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  city?: string;
  projectType?: 'villa' | 'immeuble';
  minPrice?: number;
  maxPrice?: number;
  minScore?: number;
  deliveryBefore?: string; // ISO date
  verifiedOnly?: boolean;
  featured?: boolean;
  sort?: 'score' | 'recent' | 'price_asc' | 'price_desc' | 'delivery';
}

const sortToBackend: Record<string, string> = {
  score: '-trustScore',
  recent: '-createdAt',
  price_asc: 'priceFrom',
  price_desc: '-priceFrom',
  delivery: 'timeline.deliveryDate',
};

export const projectService = {
  searchProjects: async (params?: ProjectSearchParams): Promise<{
    projects: Project[];
    total: number;
    pagination?: { page: number; pages: number; limit: number };
  }> => {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.search) query.search = params.search;
    if (params?.country) query.country = params.country;
    if (params?.city) query.city = params.city;
    if (params?.projectType) query.projectType = params.projectType;
    if (params?.minPrice != null) query.minPrice = params.minPrice;
    if (params?.maxPrice != null) query.maxPrice = params.maxPrice;
    if (params?.minScore != null) query.minScore = params.minScore;
    if (params?.deliveryBefore) query.deliveryBefore = params.deliveryBefore;
    if (params?.verifiedOnly) query.verifiedOnly = 'true';
    if (params?.featured) query.featured = 'true';
    if (params?.sort) query.sort = sortToBackend[params.sort] || sortToBackend.score;

    const data: any = await request({ url: '/api/client/projects/search', method: 'get', params: query });
    if (Array.isArray(data)) {
      return { projects: data, total: data.length, pagination: { page: 1, pages: 1, limit: data.length } };
    }
    return {
      projects: data.projects || [],
      total: data.pagination?.total ?? (data.projects?.length ?? 0),
      pagination: data.pagination,
    };
  },

  getPublicProjects: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<Project[]> => {
    const data: any = await request({ url: '/api/projects', method: 'get', params });
    return Array.isArray(data) ? data : data.projects || [];
  },

  getProject: async (id: string): Promise<Project> => {
    const data: any = await request({ url: `/api/projects/${id}`, method: 'get' });
    return data.project || data;
  },
  
  getProjectUpdates: async (projectId: string): Promise<any[]> => {
    try {
      const data: any = await request({ url: `/api/updates/project/${projectId}`, method: 'get' });
      return Array.isArray(data) ? data : data.updates || [];
    } catch (error) {
      // Si l'endpoint n'est pas accessible, retourner un tableau vide
      console.warn('Could not fetch project updates:', error);
      return [];
    }
  },
};

// ===== Favorites =====
export const favoriteService = {
  getFavorites: async (): Promise<Favorite[]> => {
    const data: any = await request({ url: '/api/client/favorites', method: 'get' });
    return Array.isArray(data) ? data : data.favorites || [];
  },

  addFavorite: async (projectId: string): Promise<Favorite> => {
    return await request({ url: `/api/client/favorites/${projectId}`, method: 'post' });
  },

  removeFavorite: async (projectId: string): Promise<void> => {
    await request({ url: `/api/client/favorites/${projectId}`, method: 'delete' });
  },

  updateFavorite: async (projectId: string, data: { notes?: string }): Promise<Favorite> => {
    return await request({ url: `/api/client/favorites/${projectId}`, method: 'put', data });
  },
};

// ===== Notifications =====
export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const data: any = await request({ url: '/api/client/notifications', method: 'get' });
    return Array.isArray(data) ? data : data.notifications || [];
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await request({ url: `/api/client/notifications/${notificationId}/read`, method: 'put' });
  },

  markAllAsRead: async (): Promise<void> => {
    await request({ url: '/api/client/notifications/read-all', method: 'post' });
  },
};

// ===== Partners =====
export const partnerService = {
  getPartners: async (params?: {
    type?: string;
  }): Promise<Partner[]> => {
    const data: any = await request({ url: '/api/partners', method: 'get', params });
    return Array.isArray(data) ? data : data.partners || [];
  },
};

// ===== Documents =====
export const documentService = {
  getDocuments: async (params?: {
    category?: string;
  }): Promise<ClientDocument[]> => {
    const favoritesResponse: any = await request({
      url: '/api/client/favorites',
      method: 'get',
      params: { limit: 100 },
    });
    const favorites = Array.isArray(favoritesResponse)
      ? favoritesResponse
      : favoritesResponse.favorites || [];

    const projectMap = new Map<
      string,
      { title?: string; promoteurName?: string; promoteurAvatar?: string }
    >();
    const projectIds = Array.from(
      new Set(
        favorites
          .map((favorite: any) => {
            const project = favorite?.project;
            const projectId =
              typeof project === 'string'
                ? project
                : project?._id || favorite?.projectId;

            if (projectId) {
              projectMap.set(projectId, {
                title: project?.title,
                promoteurName: project?.promoteur?.organizationName,
                promoteurAvatar: project?.promoteur?.logo,
              });
            }

            return projectId;
          })
          .filter(Boolean)
      )
    ) as string[];

    if (projectIds.length === 0) {
      return [];
    }

    const categoryMap: Record<string, string[]> = {
      plans: ['plans', 'technique'],
      juridique: ['foncier', 'permis', 'contrats', 'financier'],
      echanges: ['autre'],
    };
    const allowedCategories = params?.category ? categoryMap[params.category] || [] : [];

    const byProject = await Promise.all(
      projectIds.map(async (projectId) => {
        try {
          const data: any = await request({
            url: `/api/documents/project/${projectId}`,
            method: 'get',
          });
          const documents = Array.isArray(data) ? data : data.documents || [];
          return documents.map((doc: any) => {
            const metadata = projectMap.get(projectId);
            return {
              ...doc,
              projectId,
              projectName: metadata?.title || doc.projectName,
              promoteurName: metadata?.promoteurName || doc.promoteurName,
              promoteurAvatar: metadata?.promoteurAvatar || doc.promoteurAvatar,
            };
          });
        } catch {
          return [];
        }
      })
    );

    const flattened = byProject.flat();
    const filtered =
      allowedCategories.length > 0
        ? flattened.filter((doc: any) => allowedCategories.includes(doc.category))
        : flattened;

    const uniqueById = Array.from(
      new Map(filtered.map((doc: any) => [doc._id || doc.id, doc])).values()
    );

    return uniqueById
      .sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || a.uploadedAt || 0).getTime();
        const bTime = new Date(b.createdAt || b.uploadedAt || 0).getTime();
        return bTime - aTime;
      })
      .map((doc: any) => ({
        _id: doc._id || doc.id,
        name: doc.name || 'Document',
        type: doc.type === 'image' ? 'image' : doc.type === 'doc' ? 'doc' : 'pdf',
        url: doc.url,
        projectId: doc.projectId,
        projectName: doc.projectName,
        promoteurName: doc.promoteurName,
        promoteurAvatar: doc.promoteurAvatar,
        createdAt: doc.createdAt || doc.uploadedAt,
      }));
  },
};

// ===== Comparisons =====
export const comparisonService = {
  create: async (data: { projectIds: string[]; notes?: string }): Promise<any> => {
    const res: any = await request({ url: '/api/comparisons', method: 'post', data });
    return res?.data ?? res;
  },
  getMyComparisons: async (limit = 20): Promise<any[]> => {
    const res: any = await request({ url: '/api/comparisons/my-comparisons', method: 'get', params: { limit } });
    return Array.isArray(res?.data) ? res.data : res?.data ?? [];
  },
  getById: async (id: string): Promise<any> => {
    const res: any = await request({ url: `/api/comparisons/${id}`, method: 'get' });
    return res?.data ?? res;
  },
};

// ===== Reports =====
export const reportService = {
  reportContent: async (data: {
    targetId: string;
    targetType: 'project' | 'update' | 'document' | 'promoteur';
    reason: 'fraud' | 'misleading' | 'outdated' | 'inappropriate' | 'spam' | 'other';
    description: string;
    evidence?: string[];
  }): Promise<void> => {
    await request({ url: '/api/client/report', method: 'post', data });
  },
};

// ===== Alerts =====
export const alertService = {
  getMyAlerts: async (params?: { isRead?: boolean }): Promise<Alert[]> => {
    const data: any = await request({ url: '/api/alerts/my-alerts', method: 'get', params });
    return Array.isArray(data) ? data : data.data || [];
  },

  getActivePreferences: async (): Promise<Alert[]> => {
    const data: any = await request({ url: '/api/alerts/preferences', method: 'get' });
    return Array.isArray(data) ? data : data.data || [];
  },

  createAlert: async (data: Partial<Alert>): Promise<Alert> => {
    const response: any = await request({ url: '/api/alerts', method: 'post', data });
    return response.data || response;
  },

  updateAlert: async (id: string, data: Partial<Alert>): Promise<Alert> => {
    const response: any = await request({ url: `/api/alerts/${id}`, method: 'put', data });
    return response.data || response;
  },

  deleteAlert: async (id: string): Promise<void> => {
    await request({ url: `/api/alerts/${id}`, method: 'delete' });
  },

  toggleAlert: async (id: string): Promise<Alert> => {
    const response: any = await request({ url: `/api/alerts/${id}/toggle`, method: 'post' });
    return response.data || response;
  },

  markAlertAsRead: async (id: string): Promise<Alert> => {
    const response: any = await request({ url: `/api/alerts/${id}/read`, method: 'post' });
    return response.data || response;
  },

  markAllAlertsAsRead: async (): Promise<void> => {
    await request({ url: '/api/alerts/read-all', method: 'post' });
  },
};

// ===== Appointments =====
export const appointmentService = {
  getAvailableSlots: async (projectId: string, params?: { date?: string; duration?: number }): Promise<{ slots: Array<{ start: Date; end: Date }> }> => {
    return await request({ url: `/appointments/slots/${projectId}`, method: 'get', params });
  },

  createAppointment: async (data: {
    promoteurId: string;
    projectId: string;
    leadId?: string;
    scheduledAt: string;
    durationMinutes?: number;
    type: 'visio' | 'physique' | 'phone';
    notes?: string;
  }): Promise<any> => {
    return await request({ url: '/appointments', method: 'post', data });
  },

  getMyAppointments: async (): Promise<any[]> => {
    const data: any = await request({ url: '/appointments/upcoming', method: 'get' });
    return Array.isArray(data) ? data : data.appointments || [];
  },

  cancelAppointment: async (id: string): Promise<void> => {
    await request({ url: `/appointments/${id}/cancel`, method: 'patch' });
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
    return await request({ url: '/api/client/promoteur-status', method: 'get' });
  },

  createSubscription: async (data: {
    organizationName: string;
    organizationType: string;
    plan: string;
    paymentMethodId: string;
  }): Promise<{ subscriptionId: string; clientSecret: string }> => {
    return await request({ url: '/api/client/become-promoteur', method: 'post', data });
  },

  confirmPayment: async (subscriptionId: string): Promise<{ success: boolean; message: string }> => {
    return await request({ url: '/api/client/confirm-become-promoteur', method: 'post', data: { subscriptionId } });
  },

  /** Créer une session Stripe Checkout → retourne { url } pour redirection */
  createCheckout: async (data: {
    plan: string;
    organizationName: string;
    organizationType: string;
  }): Promise<{ url: string; sessionId: string }> => {
    return await request({ url: '/api/client/become-promoteur-checkout', method: 'post', data });
  },

  /** Vérifier la session après retour de Stripe — active le compte si webhook pas encore passé */
  verifySession: async (sessionId: string): Promise<{
    success: boolean;
    alreadyActivated: boolean;
    plan?: string;
  }> => {
    return await request({ url: '/api/client/verify-become-promoteur-session', method: 'get', params: { session_id: sessionId } });
  },
};

// ===== Chat Service =====
export const chatService = {
  getConversations: async (): Promise<any[]> => {
    console.log('[chatService] getConversations - fetching from /api/chat/rt/conversations');
    const data: any = await request({ url: '/api/chat/rt/conversations', method: 'get' });
    console.log('[chatService] getConversations - response:', data);
    const conversations = data?.conversations || data || [];
    console.log('[chatService] getConversations - returning', conversations.length, 'conversations');
    return conversations;
  },

  getMessages: async (conversationId: string, page: number = 1): Promise<any[]> => {
    const data: any = await request({
      url: `/api/chat/rt/conversations/${conversationId}/messages`,
      method: 'get',
      params: { page },
    });
    return data?.messages || data || [];
  },

  sendMessage: async (conversationId: string, content: string, type: string = 'text'): Promise<any> => {
    return await request({
      url: `/api/chat/rt/conversations/${conversationId}/messages`,
      method: 'post',
      data: { content, type },
    });
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await request({
      url: `/api/chat/rt/conversations/${conversationId}/read`,
      method: 'patch',
    });
  },

  createConversation: async (participants: { user: string; role?: string }[]): Promise<any> => {
    return await request({
      url: '/api/chat/rt/conversations',
      method: 'post',
      data: { participants },
    });
  },
};

// ===== Price Analytics =====
export const priceAnalyticsService = {
  getAreaStats: async (country: string, city: string, area: string, projectType?: string) => {
    const params = projectType ? { projectType } : {};
    return await request({ url: `/api/price-analytics/area/${country}/${city}/${area}`, method: 'get', params });
  },

  getCityOverview: async (country: string, city: string) => {
    return await request({ url: `/api/price-analytics/city/${country}/${city}`, method: 'get' });
  },

  getCityComparison: async (country: string, city: string) => {
    return await request({ url: `/api/price-analytics/compare/${country}/${city}`, method: 'get' });
  },

  getAreaTrends: async (country: string, city: string, area: string, projectType?: string) => {
    const params = projectType ? { projectType } : {};
    return await request({ url: `/api/price-analytics/trends/${country}/${city}/${area}`, method: 'get', params });
  },

  searchAreas: async (query: string) => {
    return await request({ url: '/api/price-analytics/search', method: 'get', params: { query } });
  },

  getAffordableAreas: async (country: string, city: string, maxPrice: number) => {
    return await request({ url: `/api/price-analytics/affordable/${country}/${city}`, method: 'get', params: { maxPrice } });
  },
};
