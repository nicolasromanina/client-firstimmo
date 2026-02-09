import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  clientProfileService,
  projectService,
  favoriteService,
  notificationService,
  partnerService,
  documentService,
  becomePromoteurService,
} from '@/lib/services';

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
export const useSearchProjects = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
}) => {
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

// ===== Documents =====
export const useClientDocuments = (params?: { category?: string }) => {
  return useQuery({
    queryKey: ['client', 'documents', params],
    queryFn: () => documentService.getDocuments(params),
    staleTime: 30_000,
    enabled: false, // Route /api/documents not yet implemented — disable to avoid 404
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
