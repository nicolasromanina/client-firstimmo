import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAlerts, useCreateAlert, useDeleteAlert, useToggleAlert, useMarkAlertAsRead, useMarkAllAlertsAsRead } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Plus, Trash2, Check, CheckCheck, Mail, MessageSquare, Smartphone, Globe } from 'lucide-react';
import { AlertForm } from '@/components/alerts/AlertForm';
import { AlertCard } from '@/components/alerts/AlertCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Alerts = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const { data: allAlerts, isLoading } = useAlerts();
  const { data: activeAlerts } = useAlerts({ isRead: false });
  const createAlert = useCreateAlert();
  const deleteAlert = useDeleteAlert();
  const toggleAlert = useToggleAlert();
  const markAsRead = useMarkAlertAsRead();
  const markAllAsRead = useMarkAllAlertsAsRead();

  const activeAlertsList = activeAlerts?.data || activeAlerts || [];
  const allAlertsList = allAlerts?.data || allAlerts || [];
  const readAlerts = allAlertsList.filter((a: any) => a.isRead);

  const handleCreateAlert = async (data: any) => {
    try {
      await createAlert.mutateAsync(data);
      setShowCreateForm(false);
      toast({
        title: 'Alerte créée',
        description: 'Votre alerte a été créée avec succès.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l\'alerte.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      try {
        await deleteAlert.mutateAsync(id);
        toast({
          title: 'Alerte supprimée',
          description: 'L\'alerte a été supprimée avec succès.',
        });
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible de supprimer l\'alerte.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleAlert.mutateAsync(id);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier l\'alerte.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de marquer l\'alerte comme lue.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast({
        title: 'Toutes les alertes marquées comme lues',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de marquer toutes les alertes comme lues.',
        variant: 'destructive',
      });
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'new-project': 'Nouveau projet',
      'update-published': 'Mise à jour publiée',
      'status-change': 'Changement de statut',
      'price-change': 'Changement de prix',
      'similar-project': 'Projet similaire',
      'deadline-approaching': 'Échéance approche',
      'favorite-update': 'Projet favori mis à jour',
      'promoteur-verified': 'Promoteur vérifié',
    };
    return labels[type] || type;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      case 'push':
        return <Globe className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Alertes</h1>
            <p className="text-muted-foreground mt-1">
              Recevez des notifications sur les projets qui vous intéressent
            </p>
          </div>
          <div className="flex gap-2">
            {activeAlertsList.length > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Tout marquer comme lu
              </Button>
            )}
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une alerte
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Alertes actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAlertsList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">En cours de surveillance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total déclenchements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allAlertsList.reduce((sum: number, a: any) => sum + (a.triggerCount || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Depuis le début</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Non lues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allAlertsList.filter((a: any) => !a.isRead).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Nouveautés</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <AlertForm
            onSubmit={handleCreateAlert}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createAlert.isPending}
          />
        )}

        {/* Alerts List */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Actives ({activeAlertsList.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Toutes ({allAlertsList.length})
            </TabsTrigger>
            <TabsTrigger value="read">
              Lues ({readAlerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeAlertsList.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BellOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune alerte active</h3>
                  <p className="text-muted-foreground mb-4">
                    Créez une alerte pour être notifié des changements sur les projets qui vous intéressent.
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une alerte
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeAlertsList.map((alert: any) => (
                  <AlertCard
                    key={alert._id}
                    alert={alert}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    onMarkAsRead={handleMarkAsRead}
                    getAlertTypeLabel={getAlertTypeLabel}
                    getChannelIcon={getChannelIcon}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {allAlertsList.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune alerte</h3>
                  <p className="text-muted-foreground mb-4">
                    Créez votre première alerte pour commencer à recevoir des notifications.
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une alerte
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allAlertsList.map((alert: any) => (
                  <AlertCard
                    key={alert._id}
                    alert={alert}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    onMarkAsRead={handleMarkAsRead}
                    getAlertTypeLabel={getAlertTypeLabel}
                    getChannelIcon={getChannelIcon}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="read" className="space-y-4">
            {readAlerts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Check className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune alerte lue</h3>
                  <p className="text-muted-foreground">
                    Les alertes que vous avez lues apparaîtront ici.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {readAlerts.map((alert: any) => (
                  <AlertCard
                    key={alert._id}
                    alert={alert}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    onMarkAsRead={handleMarkAsRead}
                    getAlertTypeLabel={getAlertTypeLabel}
                    getChannelIcon={getChannelIcon}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
