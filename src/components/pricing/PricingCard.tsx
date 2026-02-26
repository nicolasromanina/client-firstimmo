import { Check, X } from "lucide-react";

export interface PlanFeature {
  label: string;
  included: boolean;
  detail?: string;
}

export interface PlanData {
  name: string;
  tagline?: string;
  price: string;
  period?: string;
  setup?: string;
  accentColor?: string;
  badgeBg?: string;
  recommended?: boolean;
  features: PlanFeature[];
  ctaLabel?: string;
}

interface PricingCardProps {
  // New/primary shape used by Pricing.tsx
  plan?: PlanData;
  index?: number;

  // Legacy shape kept for backward compatibility
  title?: string;
  annualPrice?: number;
  monthlyEquiv?: number;
  setupFee?: number;
  color?: string;
  badge?: string;
  features?: string[];

  onSubscribe?: () => void;
  onContact?: () => void;
  isCurrentPlan?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  buttonLabel?: string;
}

const PricingCard = ({
  plan,
  title,
  annualPrice,
  monthlyEquiv,
  setupFee = 0,
  color,
  badge,
  features = [],
  onSubscribe,
  onContact,
  isCurrentPlan = false,
  isLoading = false,
  disabled = false,
  buttonLabel,
}: PricingCardProps) => {
  const hasPlanObject = !!plan;

  const displayTitle = hasPlanObject ? plan!.name : (title || "Plan");
  const displayColor = hasPlanObject ? (plan!.accentColor || "#6B7280") : (color || "#6B7280");
  const displayBadge = hasPlanObject ? (plan!.recommended ? "Recommande" : undefined) : badge;

  const isEnterprise = hasPlanObject
    ? String(plan!.price).toLowerCase().includes("sur devis")
    : (annualPrice ?? 0) === 0;

  const resolvedAnnualPrice = Number.isFinite(annualPrice as number) ? (annualPrice as number) : 0;
  const resolvedMonthly = Number.isFinite(monthlyEquiv as number) ? (monthlyEquiv as number) : 0;
  const resolvedSetupFee = Number.isFinite(setupFee as number) ? (setupFee as number) : 0;

  const computedLabel = isLoading
    ? "Chargement..."
    : buttonLabel ||
      (hasPlanObject
        ? plan?.ctaLabel || (isEnterprise ? "Nous contacter" : "Choisir")
        : isCurrentPlan
        ? "Plan actuel"
        : isEnterprise
        ? "Nous contacter"
        : "Souscrire");

  const handleClick = () => {
    if (isEnterprise && onContact) onContact();
    else if (onSubscribe) onSubscribe();
  };

  const renderLegacyPrice = () => {
    if (isEnterprise) {
      return (
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900">Sur devis</p>
          <p className="text-sm text-gray-500">Contactez notre equipe</p>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{resolvedAnnualPrice.toLocaleString("fr-FR")}€</span>
          <span className="text-gray-500 text-sm">/an</span>
        </div>
        <p className="text-sm text-gray-500">soit {resolvedMonthly}€/mois</p>
        {resolvedSetupFee > 0 && (
          <p className="text-xs text-orange-600 font-medium mt-1">+ {resolvedSetupFee.toLocaleString("fr-FR")}€ a la souscription</p>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-sm flex flex-col ${isCurrentPlan ? "ring-2" : ""}`}
      style={isCurrentPlan ? { boxShadow: `0 0 0 2px ${displayColor}` } : undefined}
    >
      <div className="mb-3 flex gap-2 flex-wrap min-h-[24px]">
        {isCurrentPlan && (
          <span className="inline-block text-white text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: displayColor }}>
            Plan actuel
          </span>
        )}
        {displayBadge && !isCurrentPlan && (
          <span className="inline-block text-white text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: displayColor }}>
            {displayBadge}
          </span>
        )}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{displayTitle}</h3>

      {hasPlanObject ? (
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{plan!.price}</span>
            {plan!.period ? <span className="text-gray-500 text-sm">{plan!.period}</span> : null}
          </div>
          {plan!.setup ? <p className="text-sm text-gray-500">{plan!.setup}</p> : null}
          {plan!.tagline ? <p className="text-xs text-gray-500 mt-2">{plan!.tagline}</p> : null}
        </div>
      ) : (
        renderLegacyPrice()
      )}

      <div className="-mx-6 sm:-mx-8 px-0 mb-6">
        <button
          onClick={handleClick}
          disabled={(!isEnterprise && disabled) || isCurrentPlan || isLoading}
          className={`w-full font-semibold py-3 sm:py-4 transition-colors duration-200 text-base sm:text-lg ${
            isCurrentPlan || (!isEnterprise && disabled)
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "text-white hover:opacity-90"
          }`}
          style={!isCurrentPlan && (!disabled || isEnterprise) ? { backgroundColor: displayColor } : undefined}
        >
          {computedLabel}
        </button>
      </div>

      {hasPlanObject ? (
        <ul className="space-y-3 flex-grow">
          {plan!.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: displayColor }} />
              ) : (
                <X className="w-5 h-5 flex-shrink-0 mt-0.5 text-slate-300" />
              )}
              <span className={`text-sm sm:text-base leading-relaxed ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                {feature.label}
                {feature.detail ? <span className="text-xs text-gray-400"> ({feature.detail})</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        features.length > 0 && (
          <ul className="space-y-4 flex-grow">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: displayColor }} />
                <span className="text-gray-600 text-sm sm:text-base leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
};

export default PricingCard;
