import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PricingCard from "./PricingCard";

/**
 * Plans tarifaires First Immo 2025 — identiques au dashboard promoteur
 */
const PLANS = [
  {
    id: 'starter',
    label: 'Starter',
    annualPrice: 600,
    monthlyEquiv: 50,
    setupFee: 0,
    color: '#6B7280',
    badge: undefined as string | undefined,
  },
  {
    id: 'publie',
    label: 'Publié',
    annualPrice: 1500,
    monthlyEquiv: 125,
    setupFee: 0,
    color: '#3B82F6',
    badge: undefined as string | undefined,
  },
  {
    id: 'verifie',
    label: 'Vérifié',
    annualPrice: 4200,
    monthlyEquiv: 350,
    setupFee: 800,
    color: '#10B981',
    badge: 'Vérifié',
  },
  {
    id: 'partenaire',
    label: 'Partenaire',
    annualPrice: 7200,
    monthlyEquiv: 600,
    setupFee: 2500,
    color: '#F97316',
    badge: 'Partenaire',
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    annualPrice: 0,
    monthlyEquiv: 0,
    setupFee: 0,
    color: '#8B5CF6',
    badge: 'Enterprise',
  },
];

/**
 * Section Pricing — même design que le dashboard promoteur
 * Utilisée sur la page /devenir-promoteur du client-dashboard
 */
const PricingSection = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Veuillez vous connecter pour accéder à la tarification.');
    return null;
  }

  const handleSubscribe = (planId: string) => {
    if (planId === 'enterprise') {
      navigate('/contact');
      return;
    }
    setIsLoading(planId);
    navigate(`/devenir-promoteur/paiement?plan=${planId}`);
  };

  return (
    <section className="w-full min-h-screen bg-gray-100 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre plan
          </h2>
          <p className="text-gray-600 text-lg">
            Facturation annuelle — économisez par rapport au mensuel
          </p>
        </div>

        {/* Grille des 5 plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6 lg:gap-8 justify-items-center">
          {PLANS.map((plan) => {
            const isEnterprise = plan.annualPrice === 0;
            const isCardLoading = isLoading === plan.id;

            return (
              <PricingCard
                key={plan.id}
                title={plan.label}
                annualPrice={plan.annualPrice}
                monthlyEquiv={plan.monthlyEquiv}
                setupFee={plan.setupFee}
                color={plan.color}
                badge={plan.badge}
                features={[]}
                onSubscribe={isEnterprise ? undefined : () => handleSubscribe(plan.id)}
                onContact={isEnterprise ? () => handleSubscribe(plan.id) : undefined}
                isCurrentPlan={false}
                isLoading={isCardLoading}
                disabled={false}
              />
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-10">
          Tous les prix sont en euros HT, facturés annuellement. Les frais de setup sont facturés une seule fois à la souscription.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
