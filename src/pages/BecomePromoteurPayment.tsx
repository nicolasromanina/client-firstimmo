import { useSearchParams, Navigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import FeaturesSection from "@/components/payment/FeaturesSection";
import PaymentForm from "@/components/payment/PaymentForm";
import ProjectCard from "@/components/payment/ProjectCard";
import Footer from "@/components/Footer";
import projet1 from "@/assets/projet-1.png";
import projet2 from "@/assets/projet-2.png";

/**
 * Données des projets affichés (exemples)
 */
const projects = [
  {
    title: "Projet residence ipsum B",
    description: "Rorem ipsum dolor sit amet, elit consectetur adipiscing",
    status: "Terminé",
    deliveryDate: "Livraison Juin 2026",
    imageUrl: projet1,
  },
  {
    title: "Projet immeuble ipsum",
    description: "Rorem ipsum dolor sit amet, elit consectetur adipiscing",
    status: "Terminé",
    deliveryDate: "Livraison Juillet 2026",
    imageUrl: projet2,
  },
];

/**
 * Page de paiement pour devenir promoteur
 * Affiche les projets, formulaire de paiement et section features
 * Layout identique à la page Payment du dashboard promoteur
 */
const BecomePromoteurPayment = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");

  // Si pas de plan sélectionné ou plan invalide, rediriger vers le choix de plan
  // Enterprise n'a pas de flux de paiement direct (sur devis → contact)
  if (!plan || !["starter", "publie", "verifie", "partenaire"].includes(plan)) {
    return <Navigate to="/devenir-promoteur" replace />;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Section principale - Projets et formulaire de paiement */}
      <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Colonne gauche - Titre et cartes de projets */}
            <div>
              {/* Titre principal */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Finalisez votre inscription promoteur
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                Complétez vos informations et procédez au paiement pour
                activer votre compte promoteur et commencer à publier vos
                projets.
              </p>

              {/* Liste des cartes de projets */}
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <ProjectCard
                    key={index}
                    title={project.title}
                    description={project.description}
                    status={project.status}
                    deliveryDate={project.deliveryDate}
                    imageUrl={project.imageUrl}
                  />
                ))}
              </div>
            </div>

            {/* Colonne droite - Formulaire de paiement */}
            <div className="lg:pl-8">
              <Elements stripe={stripePromise}>
                <PaymentForm plan={plan} />
              </Elements>
            </div>
          </div>
        </div>
      </section>

      {/* Section Features */}
      <FeaturesSection />

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default BecomePromoteurPayment;
