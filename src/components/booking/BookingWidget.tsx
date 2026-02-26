import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Video, Phone, MapPin, Check } from 'lucide-react';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { request } from '@/lib/client';

interface BookingWidgetProps {
  projectId: string;
  promoteurId: string;
  leadId?: string;
  onSuccess?: () => void;
}

type BookingFormData = {
  date: string;
  time: string;
  type: 'visio' | 'physique' | 'phone';
  notes?: string;
};

export const BookingWidget = ({ projectId, promoteurId, leadId, onSuccess }: BookingWidgetProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BookingFormData>();

  const selectedType = watch('type');

  // Générer les 14 prochains jours
  const today = new Date();
  const next14Days = eachDayOfInterval({
    start: today,
    end: addDays(today, 13),
  });

  // Récupérer les créneaux disponibles pour une date
  const fetchAvailableSlots = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response: any = await request({
        url: `/appointments/slots/${projectId}`,
        method: 'get',
        params: { date: dateStr, duration: 30 },
      });
      
      const slots = response?.slots || [];
      const timeSlots = slots.map((slot: any) => {
        const start = new Date(slot.start);
        return format(start, 'HH:mm');
      });
      
      setAvailableSlots(timeSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setValue('date', format(date, 'yyyy-MM-dd'));
    fetchAvailableSlots(date);
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedDate) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une date',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const scheduledAt = new Date(`${data.date}T${data.time}`);
      
      await request({
        url: '/appointments',
        method: 'post',
        data: {
          promoteurId,
          projectId,
          leadId,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: 30,
          type: data.type,
          notes: data.notes,
        },
      });

      toast({
        title: 'Rendez-vous réservé',
        description: 'Votre demande de rendez-vous a été envoyée. Vous recevrez une confirmation par email.',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de réserver le rendez-vous',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions = [
    { value: 'visio', label: 'Visio', icon: Video },
    { value: 'physique', label: 'Sur place', icon: MapPin },
    { value: 'phone', label: 'Téléphone', icon: Phone },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réserver un rendez-vous</CardTitle>
        <CardDescription>
          Choisissez une date et un créneau pour rencontrer le promoteur
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Type de rendez-vous */}
          <div className="space-y-2">
            <Label>Type de rendez-vous</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value as 'visio' | 'physique' | 'phone')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Sélection de la date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="grid grid-cols-7 gap-2">
              {next14Days.map((day) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);
                const isPast = day < today;

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => !isPast && handleDateSelect(day)}
                    disabled={isPast}
                    className={`
                      p-3 rounded-lg border text-center transition-colors
                      ${isPast ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
                      ${isSelected ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-200'}
                      ${isToday && !isSelected ? 'ring-2 ring-blue-300' : ''}
                    `}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {format(day, 'EEE', { locale: fr }).substring(0, 3)}
                    </div>
                    <div className="text-sm font-medium">
                      {format(day, 'd')}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Sélection de l'heure */}
          {selectedDate && (
            <div className="space-y-2">
              <Label>Heure</Label>
              {availableSlots.length === 0 ? (
                <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                  Aucun créneau disponible pour cette date. Veuillez choisir une autre date.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setValue('time', time)}
                      className={`
                        p-2 rounded-lg border text-sm transition-colors
                        ${watch('time') === time
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Informations supplémentaires..."
              className="min-h-[100px]"
            />
          </div>

          {/* Bouton de soumission */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !selectedDate || !watch('time') || !selectedType}
          >
            {isLoading ? (
              'Réservation...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Réserver le rendez-vous
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
