import React from 'react';
import { X, CheckCircle, Clock, Circle } from 'lucide-react';
import { useProjectUpdates } from '@/hooks/useApi';

const PHASES = [
  { key: 'permis-de-construire', label: 'Permis de construire' },
  { key: 'pre-commercialisation', label: 'Pré-commercialisation' },
  { key: 'demarrage-chantier', label: 'Démarrage chantier' },
  { key: 'fondations', label: 'Fondations' },
  { key: 'gros-oeuvres', label: 'Gros oeuvres' },
  { key: 'second-oeuvres', label: 'Second oeuvres' },
  { key: 'livraison', label: 'Livraison' },
];

const toWebp = (url: string): string => {
  if (!url) return url;
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', '/upload/f_webp,q_auto/');
  }
  return url;
};

interface AdvancementModalProps {
  project: any;
  onClose: () => void;
}

export const AdvancementModal: React.FC<AdvancementModalProps> = ({ project, onClose }) => {
  const { data: updates = [] } = useProjectUpdates(project._id);

  const currentPhaseIndex = PHASES.findIndex((p) => p.key === project.status);
  const progressPercent = Math.max(0, (currentPhaseIndex / (PHASES.length - 1)) * 100);

  // Construire les données pour chaque milestone
  const milestones = PHASES.map((phase, index) => {
    const phaseUpdates = updates.filter((u) => u.projectStatus === phase.key);
    const latestUpdate = phaseUpdates[phaseUpdates.length - 1];

    let status: 'completed' | 'active' | 'upcoming';
    if (index < currentPhaseIndex) status = 'completed';
    else if (index === currentPhaseIndex) status = 'active';
    else status = 'upcoming';

    return {
      phase,
      status,
      description: latestUpdate?.description || `${phase.label} en cours`,
      details: latestUpdate?.whatsDone || 'En attente de mise à jour',
      nextStep: latestUpdate?.nextStep,
      date: latestUpdate?.nextMilestoneDate
        ? new Date(latestUpdate.nextMilestoneDate).toLocaleDateString('fr-FR')
        : undefined,
      photos: latestUpdate?.photos?.slice(0, 3) || [],
    };
  });

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 text-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{project.title || project.name}</h1>
            <p className="text-sm text-slate-400 mt-1">État d'avancement du projet</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Progress Stepper */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {PHASES.map((phase, index) => (
                <React.Fragment key={phase.key}>
                  {index > 0 && (
                    <div
                      className="flex-1 h-1 rounded-full transition-colors"
                      style={{
                        backgroundColor: index <= currentPhaseIndex ? '#ef4444' : '#64748b',
                      }}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      index < currentPhaseIndex
                        ? 'bg-red-500'
                        : index === currentPhaseIndex
                          ? 'bg-blue-500'
                          : 'bg-slate-600'
                    }`}
                  >
                    {index < currentPhaseIndex && <CheckCircle size={16} className="text-white" />}
                    {index === currentPhaseIndex && <Clock size={16} className="text-white" />}
                    {index > currentPhaseIndex && <Circle size={16} className="text-white" />}
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="text-xs text-slate-400">
              Progression: {milestones.filter((m) => m.status === 'completed').length} / {PHASES.length} phases complétées
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.phase.key}
                className="border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
              >
                {/* Milestone Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.status === 'completed'
                          ? 'bg-green-500/20'
                          : milestone.status === 'active'
                            ? 'bg-blue-500/20'
                            : 'bg-slate-700/50'
                      }`}
                    >
                      {milestone.status === 'completed' && <CheckCircle size={20} className="text-green-500" />}
                      {milestone.status === 'active' && <Clock size={20} className="text-blue-500" />}
                      {milestone.status === 'upcoming' && <Circle size={20} className="text-slate-500" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">{milestone.phase.label}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${
                          milestone.status === 'completed'
                            ? 'bg-green-500/20 text-green-300'
                            : milestone.status === 'active'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {milestone.status === 'completed'
                          ? 'Complété'
                          : milestone.status === 'active'
                            ? 'En cours'
                            : 'À venir'}
                      </span>
                    </div>
                  </div>
                  {milestone.date && (
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{milestone.date}</span>
                  )}
                </div>

                {/* Milestone Content */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-300">{milestone.description}</p>
                    {milestone.details && (
                      <p className="text-xs text-slate-500 mt-1">Détails: {milestone.details}</p>
                    )}
                  </div>

                  {milestone.nextStep && (
                    <div className="pt-2 border-t border-slate-700">
                      <p className="text-xs text-slate-400">Prochaine étape: {milestone.nextStep}</p>
                    </div>
                  )}

                  {/* Photos */}
                  {milestone.photos.length > 0 && (
                    <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {milestone.photos.map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={toWebp(photo)}
                          alt={`${milestone.phase.label} - Photo ${photoIndex + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancementModal;
