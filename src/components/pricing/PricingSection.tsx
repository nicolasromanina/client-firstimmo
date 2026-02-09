import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PricingCard from "./PricingCard";
import { usePromoteurStatus } from "@/hooks/useApi";

/**
 * Données des plans tarifaires
 * Chaque plan contient un titre, prix et liste de fonctionnalités
 */
const pricingPlans = [
  {
    id: 'basique',
    title: "Basique",
    price: 20,
    isPremium: false,
    features: [
      "Publier vos projets immobiliers",
      "Recevoir des leads basiques",
      "Accès au tableau de bord simple",
      "Support par email",
    ],
  },
  {
    id: 'standard',
    title: "Standard",
    price: 100,
    isPremium: false,
    features: [
      "Tous les avantages du plan Basique",
      "Badge de promoteur vérifié",
      "Meilleur positionnement dans les résultats",
      "Statistiques avancées",
      "Support prioritaire",
    ],
  },
  {
    id: 'premium',
    title: "Premium",
    price: 250,
    isPremium: true,
    features: [
      "Tous les avantages du plan Standard",
      "Mise en avant maximale de vos projets",
      "Accès aux leads premium",
      "Outils marketing avancés",
      "Account manager dédié",
      "API d'intégration",
    ],
  },
];

/**
 * Section Pricing - Affiche les 3 cartes de tarification
 * Layout responsive: 1 colonne mobile, 2 tablette, 3 desktop
 * Au clic sur "Souscrire", redirige vers la page de paiement avec le plan choisi
 */
const PricingSection = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: statusData } = usePromoteurStatus();
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Veuillez vous connecter pour accéder à la tarification.');
    // Optionnel: rediriger vers la page de connexion
    // navigate('/login');
    return null;
  }

  const handleSubscribe = (planId: string) => {
    setIsLoading(planId);
    // Naviguer vers la page de paiement avec le plan sélectionné
    navigate(`/devenir-promoteur/paiement?plan=${planId}`);
  };

  return (
    <section className="w-full min-h-screen bg-gray-100 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      {/* Container centré avec grille responsive */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre plan
          </h2>
          <p className="text-gray-600 text-lg">
            Développez votre activité avec nos solutions adaptées à vos besoins
          </p>
        </div>

        {/* Grille des cartes de pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              title={plan.title}
              price={plan.price}
              features={plan.features}
              isPremium={plan.isPremium}
              onSubscribe={() => handleSubscribe(plan.id)}
              isCurrentPlan={false}
              isLoading={isLoading === plan.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
