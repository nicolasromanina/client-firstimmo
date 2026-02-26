import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, MessageSquare, Smartphone, Globe } from 'lucide-react';
import type { Alert } from '@/lib/types';

interface AlertFormProps {
  onSubmit: (data: Partial<Alert>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<Alert>;
}

type AlertFormData = {
  type: Alert['type'];
  title: string;
  message: string;
  frequency: Alert['frequency'];
  channels: Alert['channels'];
  criteria: {
    countries?: string[];
    cities?: string[];
    projectTypes?: ('villa' | 'immeuble')[];
    budgetMin?: number;
    budgetMax?: number;
    minTrustScore?: number;
    verifiedOnly?: boolean;
  };
  projectId?: string;
  promoteurId?: string;
};

export const AlertForm = ({ onSubmit, onCancel, isLoading, initialData }: AlertFormProps) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AlertFormData>({
    defaultValues: initialData || {
      type: 'new-project',
      frequency: 'instant',
      channels: ['email'],
      criteria: {},
    },
  });

  const selectedChannels = watch('channels') || [];
  const selectedType = watch('type');

  const handleChannelToggle = (channel: Alert['channels'][0]) => {
    const current = selectedChannels || [];
    if (current.includes(channel)) {
      setValue('channels', current.filter((c) => c !== channel));
    } else {
      setValue('channels', [...current, channel]);
    }
  };

  const getDefaultTitle = (type: string) => {
    const titles: Record<string, string> = {
      'new-project': 'Nouveau projet dans ma zone',
      'update-published': 'Mise à jour sur mes projets favoris',
      'status-change': 'Changement de statut de projet',
      'price-change': 'Changement de prix',
      'similar-project': 'Projet similaire disponible',
      'deadline-approaching': 'Échéance approche',
      'favorite-update': 'Projet favori mis à jour',
      'promoteur-verified': 'Promoteur vérifié',
    };
    return titles[type] || 'Nouvelle alerte';
  };

  const getDefaultMessage = (type: string) => {
    const messages: Record<string, string> = {
      'new-project': 'Un nouveau projet correspondant à vos critères a été publié.',
      'update-published': 'Une nouvelle mise à jour a été publiée sur un projet que vous suivez.',
      'status-change': 'Le statut d\'un projet a changé.',
      'price-change': 'Le prix d\'un projet a été modifié.',
      'similar-project': 'Un projet similaire à vos recherches est disponible.',
      'deadline-approaching': 'L\'échéance d\'un projet approche.',
      'favorite-update': 'Un projet dans vos favoris a été mis à jour.',
      'promoteur-verified': 'Un promoteur que vous suivez a été vérifié.',
    };
    return messages[type] || 'Vous avez une nouvelle notification.';
  };

  const onFormSubmit = async (data: AlertFormData) => {
    // Auto-fill title and message if not provided
    if (!data.title) {
      data.title = getDefaultTitle(data.type);
    }
    if (!data.message) {
      data.message = getDefaultMessage(data.type);
    }

    await onSubmit({
      ...data,
      isActive: true,
      isRead: false,
      triggerCount: 0,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Créer une nouvelle alerte</CardTitle>
        <CardDescription>
          Configurez une alerte pour être notifié des changements sur les projets qui vous intéressent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type d'alerte</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                setValue('type', value as Alert['type']);
                setValue('title', getDefaultTitle(value));
                setValue('message', getDefaultMessage(value));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-project">Nouveau projet</SelectItem>
                <SelectItem value="update-published">Mise à jour publiée</SelectItem>
                <SelectItem value="status-change">Changement de statut</SelectItem>
                <SelectItem value="price-change">Changement de prix</SelectItem>
                <SelectItem value="similar-project">Projet similaire</SelectItem>
                <SelectItem value="deadline-approaching">Échéance approche</SelectItem>
                <SelectItem value="favorite-update">Projet favori mis à jour</SelectItem>
                <SelectItem value="promoteur-verified">Promoteur vérifié</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              {...register('title', { required: 'Le titre est requis' })}
              placeholder="Titre de l'alerte"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              {...register('message', { required: 'Le message est requis' })}
              placeholder="Message de l'alerte"
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Fréquence</Label>
            <Select
              value={watch('frequency')}
              onValueChange={(value) => setValue('frequency', value as Alert['frequency'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Immédiat</SelectItem>
                <SelectItem value="daily">Quotidien (résumé)</SelectItem>
                <SelectItem value="weekly">Hebdomadaire (résumé)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Channels */}
          <div className="space-y-2">
            <Label>Canaux de notification</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={selectedChannels.includes('email')}
                  onCheckedChange={() => handleChannelToggle('email')}
                />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={selectedChannels.includes('whatsapp')}
                  onCheckedChange={() => handleChannelToggle('whatsapp')}
                />
                <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms"
                  checked={selectedChannels.includes('sms')}
                  onCheckedChange={() => handleChannelToggle('sms')}
                />
                <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                  <Smartphone className="w-4 h-4" />
                  SMS
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push"
                  checked={selectedChannels.includes('push')}
                  onCheckedChange={() => handleChannelToggle('push')}
                />
                <Label htmlFor="push" className="flex items-center gap-2 cursor-pointer">
                  <Globe className="w-4 h-4" />
                  Push
                </Label>
              </div>
            </div>
            {selectedChannels.length === 0 && (
              <p className="text-sm text-destructive">Sélectionnez au moins un canal</p>
            )}
          </div>

          {/* Criteria - Simplified for now */}
          <div className="space-y-4 border-t pt-4">
            <Label>Critères (optionnel)</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin">Budget min (FCFA)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  {...register('criteria.budgetMin', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax">Budget max (FCFA)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  {...register('criteria.budgetMax', { valueAsNumber: true })}
                  placeholder="100000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minTrustScore">Score de confiance minimum</Label>
              <Input
                id="minTrustScore"
                type="number"
                min="0"
                max="100"
                {...register('criteria.minTrustScore', { valueAsNumber: true })}
                placeholder="50"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="verifiedOnly"
                {...register('criteria.verifiedOnly')}
              />
              <Label htmlFor="verifiedOnly" className="cursor-pointer">
                Promoteurs vérifiés uniquement
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || selectedChannels.length === 0}>
              {isLoading ? 'Création...' : 'Créer l\'alerte'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
