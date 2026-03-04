import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Trash2, Check, Mail, MessageSquare, Smartphone, Globe, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Alert } from '@/lib/types';

interface AlertCardProps {
  alert: Alert;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  getAlertTypeLabel: (type: string) => string;
  getChannelIcon: (channel: string) => React.ReactNode;
}

export const AlertCard = ({
  alert,
  onDelete,
  onToggle,
  onMarkAsRead,
  getAlertTypeLabel,
  getChannelIcon,
}: AlertCardProps) => {
  const isActive = alert.isActive;
  const isRead = alert.isRead;

  return (
    <Card className={!isRead ? 'border-primary/50 bg-primary/5' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{alert.title}</h3>
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? (
                  <>
                    <Bell className="w-3 h-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <BellOff className="w-3 h-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
              {!isRead && (
                <Badge variant="outline" className="bg-blue-500 text-white border-blue-500">
                  Non lu
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
          </div>
          <div className="flex gap-1">
            {!isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(alert._id)}
                title="Marquer comme lu"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(alert._id)}
              title={isActive ? 'Désactiver' : 'Activer'}
            >
              {isActive ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(alert._id)}
              title="Supprimer"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Type & Frequency */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline">{getAlertTypeLabel(alert.type)}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {alert.frequency === 'instant' ? 'Immédiat' : 
                 alert.frequency === 'daily' ? 'Quotidien' : 'Hebdomadaire'}
              </span>
            </div>
          </div>

          {/* Channels */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Canaux:</span>
            <div className="flex gap-2">
              {(alert.channels || []).map((channel) => (
                <Badge key={channel} variant="secondary" className="gap-1">
                  {getChannelIcon(channel)}
                  <span className="capitalize">{channel}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Criteria */}
          {alert.criteria && (
            <div className="text-sm space-y-1">
              <div className="text-muted-foreground font-medium">Critères:</div>
              <div className="flex flex-wrap gap-2">
                {alert.criteria.countries && alert.criteria.countries.length > 0 && (
                  <Badge variant="outline">
                    Pays: {alert.criteria.countries.join(', ')}
                  </Badge>
                )}
                {alert.criteria.cities && alert.criteria.cities.length > 0 && (
                  <Badge variant="outline">
                    Villes: {alert.criteria.cities.join(', ')}
                  </Badge>
                )}
                {alert.criteria.projectTypes && alert.criteria.projectTypes.length > 0 && (
                  <Badge variant="outline">
                    Types: {alert.criteria.projectTypes.join(', ')}
                  </Badge>
                )}
                {alert.criteria.budgetMin && alert.criteria.budgetMax && (
                  <Badge variant="outline">
                    Budget: {alert.criteria.budgetMin.toLocaleString()} - {alert.criteria.budgetMax.toLocaleString()} FCFA
                  </Badge>
                )}
                {alert.criteria.minTrustScore && (
                  <Badge variant="outline">
                    Score min: {alert.criteria.minTrustScore}/100
                  </Badge>
                )}
                {alert.criteria.verifiedOnly && (
                  <Badge variant="outline">Vérifiés uniquement</Badge>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
            {alert.triggerCount > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{alert.triggerCount} déclenchement{alert.triggerCount > 1 ? 's' : ''}</span>
              </div>
            )}
            {alert.lastTriggeredAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  Dernier: {format(new Date(alert.lastTriggeredAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                </span>
              </div>
            )}
            {alert.createdAt && (
              <div>
                Créée le {format(new Date(alert.createdAt), 'dd MMM yyyy', { locale: fr })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
