import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  clientProfileService,
  projectService,
  favoriteService,
  notificationService,
  partnerService,
  documentService,
  becomePromoteurService,
  alertService,
  appointmentService,
  comparisonService,
  reportService,
  chatService,
  priceAnalyticsService,
} from '@/lib/services';
import type { Alert } from '@/lib/types';

// ===== Client Profile =====
export const useClientProfile = () => {
  return useQuery({
    queryKey: ['client', 'profile'],
    queryFn: clientProfileService.getProfile,
    staleTime: 60_000,
  });
};

export const useUpdateClientProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof clientProfileService.updateProfile>[0]) =>
      clientProfileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'profile'] });
    },
  });
};

// ===== Projects =====
import type { ProjectSearchParams } from '@/lib/services';

export const useSearchProjects = (params?: ProjectSearchParams) => {
  return useQuery({
    queryKey: ['client', 'projects', 'search', params],
    queryFn: () => projectService.searchProjects(params),
    staleTime: 30_000,
  });
};

export const usePublicProjects = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['projects', 'public', params],
    queryFn: () => projectService.getPublicProjects(params),
    staleTime: 30_000,
  });
};

// ===== Favorites =====
export const useFavorites = () => {
  return useQuery({
    queryKey: ['client', 'favorites'],
    queryFn: favoriteService.getFavorites,
    staleTime: 30_000,
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => favoriteService.addFavorite(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'favorites'] });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => favoriteService.removeFavorite(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'favorites'] });
    },
  });
};

// ===== Notifications =====
export const useNotifications = () => {
  return useQuery({
    queryKey: ['client', 'notifications'],
    queryFn: notificationService.getNotifications,
    staleTime: 30_000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'notifications'] });
    },
  });
};

// ===== Partners =====
export const usePartners = (params?: { type?: string }) => {
  return useQuery({
    queryKey: ['client', 'partners', params],
    queryFn: () => partnerService.getPartners(params),
    staleTime: 60_000,
  });
};

export const useCreatePartnerContactRequest = () => {
  return useMutation({
    mutationFn: (data: Parameters<typeof partnerService.createContactRequest>[0]) =>
      partnerService.createContactRequest(data),
  });
};

// ===== Documents =====
export const useClientDocuments = (params?: { category?: string }) => {
  return useQuery({
    queryKey: ['client', 'documents', params],
    queryFn: () => documentService.getDocuments(params),
    staleTime: 30_000,
  });
};

// ===== Become Promoteur =====
export const usePromoteurStatus = () => {
  return useQuery({
    queryKey: ['client', 'promoteur-status'],
    queryFn: becomePromoteurService.getStatus,
    staleTime: 60_000,
  });
};

export const useCreateBecomePromoteurSubscription = () => {
  return useMutation({
    mutationFn: (data: { organizationName: string; organizationType: string; plan: string; paymentMethodId: string }) =>
      becomePromoteurService.createSubscription(data),
  });
};

export const useCreateBecomePromoteurCheckout = () => {
  return useMutation({
    mutationFn: (data: { plan: string; organizationName: string; organizationType: string }) =>
      becomePromoteurService.createCheckout(data),
  });
};

// ===== Alerts =====
export const useAlerts = (params?: { isRead?: boolean }) => {
  return useQuery({
    queryKey: ['client', 'alerts', params],
    queryFn: () => alertService.getMyAlerts(params),
    staleTime: 30_000,
  });
};

export const useActiveAlertPreferences = () => {
  return useQuery({
    queryKey: ['client', 'alerts', 'preferences'],
    queryFn: () => alertService.getActivePreferences(),
    staleTime: 60_000,
  });
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Alert>) => alertService.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'alerts'] });
    },
  });
};

export const useUpdateAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Alert> }) => alertService.updateAlert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'alerts'] });
    },
  });
};

export const useDeleteAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertService.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'alerts'] });
    },
  });
};

export const useToggleAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertService.toggleAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'alerts'] });
    },
  });
};

export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertService.markAlertAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'alerts'] });
    },
  });
};

export const useMarkAllAlertsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => alertService.markAllAlertsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'alerts'] });
    },
  });
};

// ===== Appointments =====
export const useMyAppointments = () => {
  return useQuery({
    queryKey: ['client', 'appointments'],
    queryFn: () => appointmentService.getMyAppointments(),
    staleTime: 30_000,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof appointmentService.createAppointment>[0]) =>
      appointmentService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'appointments'] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'appointments'] });
    },
  });
};

// ===== Comparisons =====
export const useMyComparisons = (limit = 20) => {
  return useQuery({
    queryKey: ['client', 'comparisons', limit],
    queryFn: () => comparisonService.getMyComparisons(limit),
    staleTime: 60_000,
  });
};

export const useComparison = (id: string | undefined) => {
  return useQuery({
    queryKey: ['client', 'comparison', id],
    queryFn: () => comparisonService.getById(id!),
    enabled: !!id,
  });
};

export const useCreateComparison = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectIds: string[]; notes?: string }) => comparisonService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'comparisons'] });
    },
  });
};

// ===== Reports =====
export const useReportContent = () => {
  return useMutation({
    mutationFn: (data: Parameters<typeof reportService.reportContent>[0]) => reportService.reportContent(data),
  });
};

// ===== Chat =====
export const useChatConversations = () => {
  return useQuery({
    queryKey: ['client', 'chat', 'conversations'],
    queryFn: () => chatService.getConversations(),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
};

export const useChatMessages = (conversationId: string | undefined) => {
  return useQuery({
    queryKey: ['client', 'chat', 'messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 5_000,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content, type }: { conversationId: string; content: string; type?: string }) =>
      chatService.sendMessage(conversationId, content, type),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client', 'chat', 'messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['client', 'chat', 'conversations'] });
    },
  });
};

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => chatService.markAsRead(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['client', 'chat', 'conversations'] });
      queryClient.invalidateQueries({ queryKey: ['client', 'chat', 'messages', conversationId] });
    },
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (participants: { user: string; role?: string }[]) => chatService.createConversation(participants),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'chat', 'conversations'] });
    },
  });
};

// ===== Price Analytics =====
export const useAreaStats = (country: string, city: string, area: string, projectType?: string) => {
  return useQuery({
    queryKey: ['price-analytics', 'area-stats', country, city, area, projectType],
    queryFn: () => priceAnalyticsService.getAreaStats(country, city, area, projectType),
    enabled: !!country && !!city && !!area,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCityOverview = (country: string, city: string) => {
  return useQuery({
    queryKey: ['price-analytics', 'city-overview', country, city],
    queryFn: () => priceAnalyticsService.getCityOverview(country, city),
    enabled: !!country && !!city,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCityComparison = (country: string, city: string) => {
  return useQuery({
    queryKey: ['price-analytics', 'city-comparison', country, city],
    queryFn: () => priceAnalyticsService.getCityComparison(country, city),
    enabled: !!country && !!city,
    staleTime: 10 * 60 * 1000,
  });
};

export const useAreaTrends = (country: string, city: string, area: string, projectType?: string) => {
  return useQuery({
    queryKey: ['price-analytics', 'trends', country, city, area, projectType],
    queryFn: () => priceAnalyticsService.getAreaTrends(country, city, area, projectType),
    enabled: !!country && !!city && !!area,
    staleTime: 10 * 60 * 1000,
  });
};

export const usePriceAnalyticsSearch = (query: string) => {
  return useQuery({
    queryKey: ['price-analytics', 'search', query],
    queryFn: () => priceAnalyticsService.searchAreas(query),
    enabled: !!query && query.length > 2,
  });
};
