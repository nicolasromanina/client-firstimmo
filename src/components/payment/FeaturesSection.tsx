import projectImage from "@/assets/project-residence.jpg";

/**
 * Données des fonctionnalités numérotées
 */
const features = [
  { number: "01", text: "Publiez vos projets immobiliers et touchez des milliers d'acheteurs potentiels." },
  { number: "02", text: "Recevez des leads qualifiés directement dans votre tableau de bord." },
  { number: "03", text: "Suivez vos statistiques et performances en temps réel." },
  { number: "04", text: "Bénéficiez d'un accompagnement dédié pour développer votre activité." },
];

/**
 * Composant FeaturesSection - Section avec titre, features numérotées et image
 * Layout responsive avec grille 2x2 pour les features
 */
const FeaturesSection = () => {
  return (
    <section className="w-full bg-slate-50 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Colonne gauche - Titre et description */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Pourquoi devenir<br />promoteur ?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-sm">
                Rejoignez notre plateforme et accédez à des outils puissants pour développer votre activité immobilière.
              </p>
            </div>
            
            {/* Texte en bas à gauche */}
            <p className="text-gray-900 font-medium text-base sm:text-lg mt-8 lg:mt-0">
              Des outils conçus pour votre réussite.
            </p>
          </div>
          
          {/* Colonne droite - Features et image */}
          <div className="flex flex-col gap-8">
            {/* Grille des features numérotées */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-3">
                  {/* Numéro orange */}
                  <span className="text-coral-500 text-2xl sm:text-3xl font-bold flex-shrink-0">
                    {feature.number}
                  </span>
                  {/* Texte de la feature */}
                  <p className="text-gray-600 text-sm leading-relaxed pt-1">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Grande image de l'immeuble */}
            <div className="w-full aspect-video rounded-3xl overflow-hidden bg-white shadow-xl">
              <img src={projectImage} alt="Projet immobilier" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
