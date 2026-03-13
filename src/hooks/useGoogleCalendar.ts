import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '@/lib/client';

export function useGoogleCalendar() {
  const queryClient = useQueryClient();

  // Check if Google Calendar is connected
  const { data, isLoading } = useQuery({
    queryKey: ['gcal-status'],
    queryFn: () => request({ url: '/api/google-calendar/status', method: 'get' }),
  });

  const isConnected = data?.connected ?? false;

  // Initiate OAuth2 flow
  const connect = () => {
    request({ url: '/api/google-calendar/auth', method: 'get' }).then((response) => {
      window.location.href = response.url;
    });
  };

  // Disconnect from Google Calendar
  const disconnectMutation = useMutation({
    mutationFn: () => request({ url: '/api/google-calendar/disconnect', method: 'delete' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gcal-status'] });
    },
  });

  // Sync single appointment
  const syncAppointmentMutation = useMutation({
    mutationFn: (appointmentId: string) =>
      request({ url: `/api/google-calendar/sync/${appointmentId}`, method: 'post' }),
  });

  // Sync all confirmed appointments
  const syncAllMutation = useMutation({
    mutationFn: () => request({ url: '/api/google-calendar/sync-all', method: 'post' }),
  });

  return {
    isConnected,
    isLoading,
    connect,
    disconnect: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
    syncAppointment: syncAppointmentMutation.mutate,
    isSyncingAppointment: syncAppointmentMutation.isPending,
    syncAll: syncAllMutation.mutate,
    isSyncingAll: syncAllMutation.isPending,
  };
}
