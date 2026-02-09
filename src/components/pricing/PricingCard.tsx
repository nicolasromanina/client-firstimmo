import { Check } from "lucide-react";

/**
 * Interface définissant les propriétés d'une carte de tarification
 * @param title - Nom du plan (Basique, Standard, Premium)
 * @param price - Prix mensuel en euros
 * @param features - Liste des fonctionnalités incluses
 * @param isPremium - Indique si c'est le plan Premium (icône orange)
 * @param onSubscribe - Callback appelé lors du clic sur le bouton de souscription
 * @param isCurrentPlan - Indique si c'est le plan actuel de l'utilisateur
 * @param isLoading - Indique si une action est en cours
 */
interface PricingCardProps {
  title: string;
  price: number;
  features: string[];
  isPremium?: boolean;
  onSubscribe?: () => void;
  isCurrentPlan?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Composant d'icône diamant utilisé dans l'en-tête des cartes
 * @param isPremium - Si true, l'icône est orange, sinon grise
 */
const DiamondIcon = ({ isPremium = false }: { isPremium?: boolean }) => (
  <div
    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
      isPremium
        ? "bg-coral-500 border-coral-500"
        : "bg-gray-100 border-gray-200"
    }`}
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icône diamant stylisée */}
      <path
        d="M12 2L2 9L12 22L22 9L12 2Z"
        stroke={isPremium ? "white" : "#374151"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 9H22"
        stroke={isPremium ? "white" : "#374151"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2L8 9L12 22L16 9L12 2Z"
        stroke={isPremium ? "white" : "#374151"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

/**
 * Composant PricingCard - Carte de tarification réutilisable
 * Affiche un plan avec son nom, prix et liste de fonctionnalités
 */
const PricingCard = ({
  title,
  price,
  features,
  isPremium = false,
  onSubscribe,
  isCurrentPlan = false,
  isLoading = false,
  disabled = false,
}: PricingCardProps) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-sm flex flex-col ${isCurrentPlan ? 'ring-2 ring-coral-500' : ''}`}>
      {/* Badge "Plan actuel" */}
      {isCurrentPlan && (
        <div className="mb-2">
          <span className="inline-block bg-coral-100 text-coral-700 text-xs font-semibold px-3 py-1 rounded-full">
            Plan actuel
          </span>
        </div>
      )}
      
      {/* En-tête: Icône + Titre du plan */}
      <div className="flex items-center gap-4 mb-4">
        <DiamondIcon isPremium={isPremium} />
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h3>
      </div>

      {/* Sous-titre descriptif */}
      <p className="text-gray-500 text-sm sm:text-base mb-4">
        Profiter de l'offre à partir de
      </p>

      {/* Section prix */}
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-4xl sm:text-5xl font-bold text-gray-900">
          {price}€
        </span>
        <span className="text-gray-500 text-base sm:text-lg">/mois</span>
      </div>

      {/* Bouton d'action - CTA principal - Pleine largeur avec marges négatives */}
      <div className="-mx-6 sm:-mx-8 px-0">
        <button 
          onClick={onSubscribe}
          disabled={disabled || isCurrentPlan || isLoading}
          className={`w-full font-semibold py-3 sm:py-4 transition-colors duration-200 mb-6 text-base sm:text-lg ${
            isCurrentPlan || disabled
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
              : 'bg-coral-500 hover:bg-coral-600 text-white'
          }`}
        >
          {isLoading || disabled ? 'Chargement...' : isCurrentPlan ? 'Plan actuel' : 'Souscrire'}
        </button>
      </div>

      {/* Liste des fonctionnalités avec checkmarks */}
      <ul className="space-y-4 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {/* Icône checkmark orange */}
            <Check className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingCard;
